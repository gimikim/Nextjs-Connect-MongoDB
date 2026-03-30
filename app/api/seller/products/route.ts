import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  // 판매자(사업자) 본인이 직접 올린 상품 목록만을 최신순으로 가져오는 API입니다.
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string }

    // 비즈니스(사업자) 계정이 아닌 유저 접근 차단
    if (decoded.role !== 'business') {
      return NextResponse.json({ message: '판매자 권한이 없습니다.' }, { status: 403 })
    }

    await dbConnect()

    // sellerId가 현재 로그인한 유저의 ID인 상품만 검색 후, 최신에 만든 것부터 반환하도록 내림차순 정렬 처리합니다.
    const products = await Product.find({ sellerId: decoded.userId }).sort({ createdAt: -1 })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Failed to fetch seller products:', error)
    return NextResponse.json({ message: '상품 목록을 가져오는데 실패했습니다.' }, { status: 500 })
  }
}
