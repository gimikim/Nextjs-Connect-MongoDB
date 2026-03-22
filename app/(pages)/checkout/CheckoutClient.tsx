'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TossPayments: any
  }
}

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

  const formatPhoneNumber = (val: string) => {
    const digits = val.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'recipientPhone') {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!window.TossPayments) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    // 1. 임시 폼 데이터 저장 (결제 브라우저 도메인 이탈 후 승인 시 사용하기 위함)
    localStorage.setItem('checkoutFormData', JSON.stringify(formData))

    // 2. 랜덤한 고유 주문번호 발급
    const orderId = 'TOSS_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000)

    // 3. 토스페이먼츠(Toss Payments) 테스트 API 호출
    const tossPayments = window.TossPayments('test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq') // 토스페이먼츠 공식 공개 테스트 공개키

    tossPayments
      .requestPayment('카드', {
        amount: finalAmount,
        orderId: orderId,
        orderName:
          checkoutItems.length > 1
            ? `${checkoutItems[0].name} 외 ${checkoutItems.length - 1}건`
            : checkoutItems[0].name,
        customerName: formData.recipientName || '고객',
        successUrl: window.location.origin + '/checkout/success', // 성공 시 돌아올 라우터
        failUrl: window.location.origin + '/checkout/fail', // 실패 시 돌아올 라우터
      })
      .catch((err: unknown) => {
        // 결제창 이탈 또는 에러
        const error = err as { code?: string; message?: string }
        if (error.code === 'USER_CANCEL') {
          alert('결제를 취소하셨습니다.')
        } else {
          alert(error.message || '결제 중 오류가 발생했습니다.')
        }
      })
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 md:py-24">
      {/* 토스페이먼츠 코어 스크립트 로딩 */}
      <Script src="https://js.tosspayments.com/v1/payment" strategy="lazyOnload" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-10 text-3xl font-extrabold tracking-tight text-slate-900">주문/결제</h1>

        <form onSubmit={handlePayment} className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex flex-1 flex-col gap-8">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-8">
              <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-slate-900">배송지 정보</h2>
                {user && (
                  <div className="flex items-center gap-5 text-[0.95rem] font-bold">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-700 transition hover:text-blue-600">
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
                    <label className="flex cursor-pointer items-center gap-2 text-slate-700 transition hover:text-blue-600">
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
                    maxLength={13}
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
