import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'
import ReviewButton from '@/app/components/ReviewButton'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
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
  const order = (await Order.findOne({ _id: params.id, userId: decoded.userId }).lean()) as any

  if (!order) {
    return <div className="p-20 text-center text-xl font-bold">주문 내역을 찾을 수 없습니다.</div>
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      {/* 뒤로 가기 네비게이션 */}
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <Link
          href="/mypage/orders"
          className="inline-flex items-center gap-2 text-[0.95rem] font-bold text-slate-500 transition hover:text-black"
        >
          <span>←</span> 목록으로 돌아가기
        </Link>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">주문 상세 내역</h1>

        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 p-6 text-white">
            <h2 className="text-lg font-bold">주문번호: {order.orderNumber}</h2>
            <span className="font-semibold text-blue-300">{formatDate(order.createdAt)}</span>
          </div>

          <div className="p-8 pb-4">
            <h3 className="mb-4 text-lg font-bold text-slate-900">주문 상품 ({order.items.length}건)</h3>
            <div className="flex flex-col gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {order.items.map((item: any) => (
                <div
                  key={item._id?.toString()}
                  className="flex items-center gap-6 border-b border-slate-100 pb-6 last:border-0 last:pb-0"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-bold text-slate-400">{item.brand}</p>
                    <p className="mb-2 text-[1.05rem] font-semibold leading-tight text-slate-800">{item.name}</p>
                    <p className="text-sm font-medium text-slate-500">
                      수량: <strong className="text-slate-800">{item.quantity}</strong>개{' '}
                      <span className="mx-2 text-slate-300">|</span> 상품 금액:{' '}
                      <strong className="text-slate-800">{item.finalPrice.toLocaleString()}</strong>원
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-center min-w-[80px] text-right gap-1.5">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                      {order.status}
                    </span>
                    {(order.status === '결제완료' || order.status === '배송완료') && (
                      <ReviewButton 
                        orderId={order._id.toString()} 
                        productId={item.productId} 
                        itemName={item.name} 
                        isReviewed={!!item.isReviewed}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 p-6">
            <h3 className="text-lg font-bold text-slate-900">배송 및 결제 정보</h3>
          </div>
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 p-8 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-bold text-slate-400">받는 사람</p>
              <p className="text-[1.05rem] font-semibold text-slate-800">{order.recipientName}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-bold text-slate-400">연락처</p>
              <p className="text-[1.05rem] font-semibold text-slate-800">{order.recipientPhone}</p>
            </div>
            <div className="md:col-span-2">
              <p className="mb-1 text-sm font-bold text-slate-400">배송지 주소</p>
              <p className="break-keep text-[1.05rem] font-semibold text-slate-800">{order.shippingAddress}</p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 md:col-span-2">
              <p className="text-lg font-bold text-slate-900">총 결제 금액</p>
              <p className="text-2xl font-black text-blue-600">{order.totalAmount.toLocaleString()}원</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
