import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/db/dbConnect'
import Product from '@/db/models/product'
import Review from '@/db/models/review'
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string }

    // 비즈니스 회원 권한 체크
    if (decoded.role !== 'business') {
      return NextResponse.json({ message: '접근 권한이 없습니다.' }, { status: 403 })
    }

    await dbConnect()

    // 판매자의 모든 상품 조회
    const products = await Product.find({ sellerId: decoded.userId }).sort({ createdAt: -1 }).lean()

    // 각 상품별로 리뷰 통계 및 목록 집계
    const productsWithReviews = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products.map(async (product: any) => {
        const productIdStr = product._id.toString()
        const reviews = await Review.find({ productId: productIdStr }).sort({ createdAt: -1 }).lean()

        let averageRating = 0
        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0)
          averageRating = sum / reviews.length
        }

        return {
          ...product,
          _id: productIdStr, // UI에서 사용하기 쉽도록 변경
          reviews,
          averageRating: Number(averageRating.toFixed(1)),
          reviewCount: reviews.length,
        }
      })
    )

    return NextResponse.json({ products: productsWithReviews })
  } catch (error) {
    console.error('Failed to fetch seller products:', error)
    return NextResponse.json({ message: '상품 목록을 불러오는데 실패했습니다.' }, { status: 500 })
  }
}
