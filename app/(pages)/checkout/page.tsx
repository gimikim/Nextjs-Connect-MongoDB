'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CheckoutItem {
  id: number
  productId: number
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

export default function CheckoutPage() {
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('checkoutItems')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.length === 0) {
          router.push('/')
        } else {
          setCheckoutItems(parsed)
        }
      } catch {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [router])

  if (!mounted || checkoutItems.length === 0) return <div className="min-h-screen bg-slate-50" />

  const totalAmount = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee = 0 // 무료 배송
  const finalAmount = totalAmount + deliveryFee

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    alert('성공적으로 결제가 완료되었습니다!')

    // 로컬 장바구니 비우기 (만약 장바구니 품목과 결제품목이 모두 일치하는 경우 등, 여기서는 생략하거나 간단히 초기화)
    // 안전하게 전부 샀다고 가정하고 지우거나, 선택된 것만 분리하는 로직을 나중에 구현할 수 있습니다.
    localStorage.removeItem('checkoutItems')
    router.push('/')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-10 text-3xl font-extrabold tracking-tight text-slate-900">주문/결제</h1>

        <form onSubmit={handlePayment} className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* 주문서 입력란 */}
          <div className="flex flex-1 flex-col gap-8">
            {/* 배송지 정보 */}
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">배송지 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">받으시는 분</label>
                  <input
                    required
                    placeholder="이름을 입력하세요"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">연락처</label>
                  <input
                    required
                    type="tel"
                    placeholder="010-0000-0000"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">배송지 주소</label>
                  <input
                    required
                    placeholder="주소를 입력하세요"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">배송 요청사항</label>
                  <input
                    placeholder="예) 문 앞에 두고 가주세요"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 주문 상품 리스트 */}
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">주문 상품 ({checkoutItems.length}건)</h2>
              <div className="space-y-4 divide-y divide-slate-100">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        {item.color} / {item.size} / {item.quantity}개
                      </p>
                    </div>
                    <div className="flex items-center font-bold text-slate-900">
                      {(item.price * item.quantity).toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 최종 결제 공간 (sticky) */}
          <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[340px]">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">결제 상세</h2>

              <div className="mb-6 space-y-4 border-b border-slate-100 pb-6 text-slate-600">
                <div className="flex justify-between">
                  <span>총 상품 금액</span>
                  <span className="font-medium text-slate-900">{totalAmount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span className="font-medium text-slate-900">
                    {deliveryFee === 0 ? '무료' : `${(deliveryFee as number).toLocaleString()}원`}
                  </span>
                </div>
              </div>

              <div className="mb-8 flex items-end justify-between">
                <span className="font-bold text-slate-900">최종 결제 금액</span>
                <span className="text-2xl font-black text-blue-600">{finalAmount.toLocaleString()}원</span>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all hover:bg-blue-700 hover:shadow-[0_6px_20px_rgb(37,99,235,0.23)] active:scale-[0.98]"
              >
                결제 진행하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
