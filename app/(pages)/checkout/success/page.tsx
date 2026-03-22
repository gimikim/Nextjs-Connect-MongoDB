'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { processOrder } from '@/app/actions/order'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [orderAmount, setOrderAmount] = useState<number | null>(null)
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) {
      setErrorMessage('비정상적인 접근이거나 결제 정보가 누락되었습니다.')
      setStatus('error')
      return
    }

    const completeOrder = async () => {
      try {
        // 원래 장바구니에 있던 결제 아이템과 작성한 배송지 정보를 복구합니다.
        const storedItems = localStorage.getItem('checkoutItems')
        const storedForm = localStorage.getItem('checkoutFormData')
        let items = []
        let formData = {}

        if (storedItems) items = JSON.parse(storedItems)
        if (storedForm) formData = JSON.parse(storedForm)

        // DB에 저장 시도
        const result = await processOrder({
          orderId,
          amount: Number(amount),
          items,
          formData,
        })

        if (!result.success) {
          console.error('Server action rejected:', result)
          setErrorMessage(`에러 원인:\n${result.error}\n\n상세 속성 에러:\n${result.details}\n\n전달된 아이템 배열:\n${JSON.stringify(result.passedItems, null, 2)}`)
          setStatus('error')
          return
        }

        setOrderAmount(Number(amount))

        // 데이터 휘발
        localStorage.removeItem('checkoutItems')
        localStorage.removeItem('checkoutFormData')

        // 결제 완료로 상태 업데이트
        setStatus('success')

        // 커스텀 장바구니 업데이트 이벤트를 통해 글로벌 카운트 다운
        window.dispatchEvent(new Event('cartUpdated'))
      } catch (error) {
        const err = error as Error
        setErrorMessage(err.message || '주문 처리 중 알 수 없는 코드 오류가 발생했습니다.')
        setStatus('error')
      }
    }

    completeOrder()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 pb-20">
        <div className="text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <h2 className="text-2xl font-bold text-slate-800">결제를 처리하는 중입니다...</h2>
          <p className="mt-2 text-slate-500">창을 닫거나 새로고침하지 마세요.</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 pb-20 pt-8">
        <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-8 sm:p-10 text-center shadow-lg">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-red-500">
            ❌
          </div>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">결제 처리 실패 내역</h2>
          
          <div className="mb-8 overflow-hidden rounded-xl bg-[#1e1e1e] text-left text-[0.8rem] leading-relaxed shadow-inner">
            <div className="border-b border-[#333] bg-[#2d2d2d] px-4 py-2 font-bold text-slate-200">디버깅 에러 로그 (개발자용)</div>
            <pre className="max-h-[300px] overflow-y-auto whitespace-pre-wrap p-4 font-mono text-[#a6accd]">
              {errorMessage}
            </pre>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            결제 다시 시도하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 pb-20">
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
          🎉
        </div>
        <h2 className="mb-2 text-3xl font-extrabold text-slate-900">결제 완료!</h2>
        <p className="mb-8 font-medium text-slate-500">
          주문번호 <strong className="text-slate-700">{searchParams.get('orderId')}</strong>
          <br />총 <strong className="text-blue-600">{orderAmount?.toLocaleString()}원</strong> 안전하게 결제되었습니다.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/mypage/orders"
            className="flex-1 rounded-2xl bg-slate-900 py-4 font-bold text-white transition hover:bg-slate-800 active:scale-95"
          >
            주문내역 보기
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-2xl bg-blue-50 py-4 font-bold text-blue-600 transition hover:bg-blue-100 active:scale-95"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  )
}
