import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'
import jwt from 'jsonwebtoken'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }

    await dbConnect()

    // 보안을 위해, 삭제 요청한 주문이 '본인의 주문'인지 확실히 검증합니다.
    const order = await Order.findOne({ _id: params.id, userId: decoded.userId })
    if (!order) {
      return NextResponse.json({ message: '주문 내역을 찾을 수 없거나 권한이 없습니다.' }, { status: 404 })
    }

    await Order.deleteOne({ _id: params.id, userId: decoded.userId })

    return NextResponse.json({ message: '주문 내역이 정상적으로 삭제되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ message: '오류가 발생했습니다.' }, { status: 500 })
  }
}
