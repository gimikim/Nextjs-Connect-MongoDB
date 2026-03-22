import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'

import User from '@/db/models/user'
import { seedMockOrders } from '@/lib/seedOrders'
import OrderListClient from './OrderListClient'

export default async function OrdersPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) redirect('/auth?type=login')

  let decoded: { userId: string }
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    decoded = jwt.verify(token, jwtSecret) as { userId: string }
  } catch {
    redirect('/auth?type=login')
  }

  await dbConnect()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (await User.findById(decoded.userId).lean()) as any
  if (!user) redirect('/auth?type=login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rawOrders = (await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean()) as any[]

  // 만약 사용자의 주문 내역이 아예 없다면, 화면 테스트를 위해 가짜 주문 3건을 즉시 채워넣습니다.
  if (rawOrders.length === 0) {
    await seedMockOrders(user._id, user.address || '등록된 주소 없음', user.name, user.phoneNumber || '010-0000-0000')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawOrders = (await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean()) as any[]
  }

  // Next.js 클라이언트 컴포넌트로 객체를 넘길 때 Date나 ObjectId는 직렬화(JSON) 에러가 발생할 수 있으므로 강제 문자열 변환합니다.
  const serializedOrders = rawOrders.map((o) => ({
    _id: o._id.toString(),
    orderNumber: o.orderNumber,
    totalAmount: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: o.items.map((i: any) => ({
      _id: i._id ? i._id.toString() : Math.random().toString(),
      productId: i.productId,
      name: i.name,
      brand: i.brand,
      price: i.price,
      discount: i.discount,
      finalPrice: i.finalPrice,
      quantity: i.quantity,
      image: i.image,
      isReviewed: !!i.isReviewed,
    })),
  }))

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8 flex items-end justify-between border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">주문/배송 조회</h1>
      </div>

      {/* 클라이언트 사이드 컴포넌트 호출 (필터링 및 UI 렌더링) */}
      <OrderListClient initialOrders={serializedOrders} />
    </div>
  )
}
