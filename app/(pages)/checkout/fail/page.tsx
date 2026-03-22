'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutFailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const errorMessage = searchParams.get('message') || '알 수 없는 이유로 결제를 실패했습니다.'
  const errorCode = searchParams.get('code') || 'ERROR'

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 pb-20">
      <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-red-500">
          !
        </div>
        <h2 className="mb-4 text-2xl font-bold text-slate-900">결제를 완료하지 못했어요</h2>

        <div className="mb-8 rounded-xl bg-slate-50 p-4 text-left">
          <p className="mb-1 text-xs font-bold text-slate-400">오류 코드: {errorCode}</p>
          <p className="font-semibold text-slate-800">{errorMessage}</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/checkout')}
            className="flex-1 rounded-2xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            다시 시도하기
          </button>
          <Link
            href="/cart"
            className="flex-1 rounded-2xl border border-slate-200 bg-white py-4 font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            장바구니로
          </Link>
        </div>
      </div>
    </div>
  )
}
