import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'
import jwt from 'jsonwebtoken'

// 동적 경로 파라미터(id)를 수신받기 위한 인터페이스입니다.
interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(req: NextRequest, { params }: Params) {
  // 특정 id를 가진 상품의 상세 정보를 조회하는 API입니다.
  try {
    const { id } = await params
    await dbConnect()
    // MongoDB _id 값을 통해 특정 상품 검색
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ message: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ message: '상품 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  // 등록된 상품의 정보(이미지, 가격 등)를 수정하는 API입니다. 자신이 올린 상품만 수정 가능해야 합니다.
  try {
    const { id } = await params
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }

    await dbConnect()
    const product = await Product.findById(id)

    // 수정하려는 상품이 존재하는지 확인합니다.
    if (!product) {
      return NextResponse.json({ message: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 데이터베이스 상의 sellerId와 현재 로그인한 사용자의 토큰 userId가 동일한지 일치 여부를 검사해 보안을 유지합니다.
    if (product.sellerId.toString() !== decoded.userId) {
      return NextResponse.json({ message: '해당 상품을 수정할 권한이 없습니다.' }, { status: 403 })
    }

    const body = await req.json()
    // 필드 세부 사항을 업데이트 후, 수정된 최신 버전을 반환하도록 세팅합니다({ new: true }).
    const updatedProduct = await Product.findByIdAndUpdate(id, { $set: body }, { new: true })

    return NextResponse.json({ message: '상품이 성공적으로 수정되었습니다.', product: updatedProduct })
  } catch (error) {
    console.error('Failed to update product:', error)
    return NextResponse.json({ message: '상품 수정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  // 상품을 아예 데이터베이스에서 제거하는 API입니다.
  try {
    const { id } = await params
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }

    await dbConnect()
    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ message: '상품을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 본인이 직접 등록한 상품만 삭제할 수 있도록 접근을 제한합니다.
    if (product.sellerId.toString() !== decoded.userId) {
      return NextResponse.json({ message: '해당 상품을 삭제할 권한이 없습니다.' }, { status: 403 })
    }

    await Product.findByIdAndDelete(id)

    return NextResponse.json({ message: '상품이 삭제되었습니다.' })
  } catch {
    return NextResponse.json({ message: '상품 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
