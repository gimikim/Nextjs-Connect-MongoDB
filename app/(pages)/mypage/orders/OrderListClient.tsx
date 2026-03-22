'use client'

import { useState } from 'react'
import Link from 'next/link'

type OrderItem = {
  _id: string
  productId: number
  name: string
  brand: string
  finalPrice: number
  quantity: number
  image: string
}

type SerializedOrder = {
  _id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
  items: OrderItem[]
}

export default function OrderListClient({ initialOrders }: { initialOrders: SerializedOrder[] }) {
  const currentYear = new Date().getFullYear()
  const [filter, setFilter] = useState<string>('6months')

  // 필터링 로직
  const filteredOrders = initialOrders.filter((order) => {
    const orderDate = new Date(order.createdAt)
    const now = new Date()

    if (filter === '6months') {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(now.getMonth() - 6)
      return orderDate >= sixMonthsAgo
    } else {
      // 연도 필터인 경우
      return orderDate.getFullYear() === parseInt(filter, 10)
    }
  })

  // 상태별 뱃지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case '결제완료':
        return 'bg-slate-100 text-slate-600'
      case '상품준비중':
        return 'bg-blue-100 text-blue-600'
      case '배송중':
        return 'bg-indigo-100 text-indigo-700'
      case '배송완료':
        return 'bg-green-100 text-green-700 font-bold'
      case '주문취소':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const formatDate = (isoString: string) => {
    const d = new Date(isoString)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  }

  return (
    <>
      <div className="mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('6months')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === '6months' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              최근 6개월
            </button>
            <button
              onClick={() => setFilter(currentYear.toString())}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === currentYear.toString() ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {currentYear}년
            </button>
            <button
              onClick={() => setFilter((currentYear - 1).toString())}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === (currentYear - 1).toString() ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {currentYear - 1}년
            </button>
          </div>
          <div className="text-sm font-medium text-slate-500">
            총 <span className="font-bold text-blue-600">{filteredOrders.length}</span>건의 주문이 있습니다.
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center font-medium text-slate-400">해당 기간의 주문 내역이 없습니다.</div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-lg font-bold text-slate-900">{formatDate(order.createdAt)}</span>
                    <span className="ml-3 text-sm text-slate-400">주문번호: {order.orderNumber}</span>
                  </div>
                  <Link
                    href={`/mypage/orders/${order._id}`}
                    className="text-sm font-bold text-blue-600 hover:underline"
                  >
                    주문 상세 보기 &rarr;
                  </Link>
                </div>

                <div className="flex flex-col gap-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-5">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 text-xs font-bold text-slate-400">{item.brand}</div>
                        <div className="line-clamp-1 text-[0.95rem] font-semibold leading-tight text-slate-800">
                          {item.name}
                        </div>
                        <div className="mt-2 text-sm font-medium text-slate-600">
                          <span className="font-bold text-slate-900">{item.finalPrice.toLocaleString()}원</span> /{' '}
                          {item.quantity}개
                        </div>
                      </div>
                      <div className="min-w-[80px] flex-shrink-0 text-center">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
