import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/db/dbConnect'
import Product, { IProduct } from '@/db/models/product'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  // 메인 페이지 및 상품 검색용 GET API입니다.
  // 등록된 상품 목록 중 판매 가능한(isAvailable: true) 상품들을 반환합니다.
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const searchQuery = searchParams.get('search') || '' // URL의 쿼리 스트링에서 'search' 값을 가져옵니다.
  const categoryQuery = searchParams.get('category') || '' // 새롭게 추가된 category 파라미터입니다.

  try {
    // 디버깅: 전체 상품 개수 확인
    const totalCount = await Product.countDocuments({})
    console.log('Total products in database:', totalCount)

    // 기본적으로 판매 중인 상품만 필터링합니다. (isAvailable이 false인 것만 제외)
    let query: mongoose.FilterQuery<IProduct> = { isAvailable: { $ne: false } }

    // 검색어가 있다면 상품명(name), 브랜드(brand), 카테고리(category), 설명(description)에서 부분 일치 검색 처리합니다.
    if (searchQuery) {
      query = {
        ...query,
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { brand: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    }

    // 카테고리 필터링이 있다면 쿼리에 추가합니다. ('전체'가 아닐 때만)
    if (categoryQuery && categoryQuery !== '전체') {
      query.category = categoryQuery
    }

    // 생성일 기준 내림차순(-1)으로 정렬하여 최신 상품부터 반환합니다.
    console.log('Final Fetch query:', JSON.stringify(query))
    const products = await Product.find(query).sort({ createdAt: -1 })
    console.log('Fetched filtered products count:', products.length)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ message: '상품 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // 판매자가 새로운 상품을 등록 요청을 처리하는 API입니다.
  try {
    const token = req.cookies.get('auth_token')?.value
    // 로그인된 사용자인지(토큰이 있는지) 확인합니다.
    if (!token) {
      return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    // JWT 토큰을 해독하여 사용자 정보를 추출합니다.
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string }

    // 비즈니스(사업자) 계정인지만 상품을 등록할 수 있도록 합니다.
    if (decoded.role !== 'business') {
      return NextResponse.json({ message: '상품 등록은 사업자(판매자) 회원만 가능합니다.' }, { status: 403 })
    }

    const body = await req.json()
    await dbConnect()

    // 추출한 사용자 ID를 sellerId로 하여 새 상품 모델 객체를 생성합니다.
    const newProduct = new Product({
      ...body,
      sellerId: decoded.userId,
    })

    // 데이터베이스에 저장합니다.
    await newProduct.save()

    return NextResponse.json({ message: '상품이 성공적으로 등록되었습니다.', product: newProduct }, { status: 201 })
  } catch (error) {
    console.error('Failed to create product:', error)
    return NextResponse.json({ message: '상품 등록 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
