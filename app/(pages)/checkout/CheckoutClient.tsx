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

interface UserData {
  name: string
  phoneNumber: string
  address: string
}

export default function CheckoutClient({ user }: { user: UserData | null }) {
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [addressType, setAddressType] = useState<'default' | 'new'>(user ? 'default' : 'new')

  const [formData, setFormData] = useState({
    recipientName: user?.name || '',
    recipientPhone: user?.phoneNumber || '',
    shippingAddress: user?.address || '',
    request: '',
  })

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

  useEffect(() => {
    if (addressType === 'default' && user) {
      setFormData((prev) => ({
        ...prev,
        recipientName: user.name || '',
        recipientPhone: user.phoneNumber || '',
        shippingAddress: user.address || '',
      }))
    } else if (addressType === 'new') {
      setFormData((prev) => ({
        ...prev,
        recipientName: '',
        recipientPhone: '',
        shippingAddress: '',
      }))
    }
  }, [addressType, user])

  if (!mounted || checkoutItems.length === 0) return <div className="min-h-screen bg-slate-50" />

  const totalAmount = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const deliveryFee = 0 // 무료 배송
  const finalAmount = totalAmount + deliveryFee

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    alert('성공적으로 결제가 완료되었습니다!')
    localStorage.removeItem('checkoutItems')
    router.push('/')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-10 text-3xl font-extrabold tracking-tight text-slate-900">주문/결제</h1>

        <form onSubmit={handlePayment} className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex flex-1 flex-col gap-8">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
              <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-slate-900">배송지 정보</h2>
                {user && (
                  <div className="flex items-center gap-5 text-[0.95rem] font-bold">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-700 hover:text-blue-600 transition">
                      <input
                        type="radio"
                        name="addressType"
                        value="default"
                        checked={addressType === 'default'}
                        onChange={() => setAddressType('default')}
                        className="h-4 w-4 border-gray-300 text-blue-600 outline-none focus:ring-blue-600"
                      />
                      기존 배송지
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-slate-700 hover:text-blue-600 transition">
                      <input
                        type="radio"
                        name="addressType"
                        value="new"
                        checked={addressType === 'new'}
                        onChange={() => setAddressType('new')}
                        className="h-4 w-4 border-gray-300 text-blue-600 outline-none focus:ring-blue-600"
                      />
                      신규 배송지
                    </label>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">받으시는 분</label>
                  <input
                    required
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="이름을 입력하세요"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-black outline-none placeholder:font-medium focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">연락처</label>
                  <input
                    required
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-black outline-none placeholder:font-medium focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">배송지 주소</label>
                  <input
                    required
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    placeholder="주소를 입력하세요"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-black outline-none placeholder:font-medium focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">배송 요청사항</label>
                  <input
                    name="request"
                    value={formData.request}
                    onChange={handleChange}
                    placeholder="예) 문 앞에 두고 가주세요"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-black outline-none placeholder:font-medium focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

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
                      <p className="text-[0.8rem] font-medium text-slate-500">
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

          <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[340px]">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900">결제 상세</h2>

              <div className="mb-6 space-y-4 border-b border-slate-100 pb-6 text-slate-600">
                <div className="flex flex-wrap justify-between">
                  <span className="font-semibold">총 상품 금액</span>
                  <span className="font-bold text-slate-900">{totalAmount.toLocaleString()}원</span>
                </div>
                <div className="flex flex-wrap justify-between">
                  <span className="font-semibold">배송비</span>
                  <span className="font-bold text-slate-900">
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
                className="w-full rounded-2xl bg-blue-600 py-4 text-[1.05rem] font-bold text-white shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all hover:bg-blue-700 hover:shadow-[0_6px_20px_rgb(37,99,235,0.23)] active:scale-[0.98]"
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
