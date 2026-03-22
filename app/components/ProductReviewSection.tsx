'use client'

import { useEffect, useState } from 'react'
import { getReviews } from '@/app/actions/review'

interface ReviewType {
  _id: string
  rating: number
  content: string
  image?: string
  createdAt: string
  userName: string
}

export default function ProductReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<ReviewType[]>([])
  const [stats, setStats] = useState({ total: 0, avg: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      const result = await getReviews(productId)
      if (result.success) {
        setReviews(result.reviews || [])
        setStats(result.stats || { total: 0, avg: 0 })
      }
      setLoading(false)
    }
    fetchReviews()
  }, [productId])

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5 text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-lg ${star <= rating ? 'text-yellow-400 drop-shadow-sm' : 'text-slate-200'}`}>
          ★
        </span>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="mt-12 py-16 text-center text-sm font-bold text-slate-400 animate-pulse bg-white/50 rounded-3xl">
        상품 리뷰를 안전하게 불러오고 있습니다...
      </div>
    )
  }

  return (
    <div className="mt-12 w-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
      <div className="mb-10 flex flex-col items-center justify-center gap-4 border-b border-slate-100 pb-8 text-center sm:flex-row sm:justify-start sm:gap-8 sm:text-left">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">상품 리뷰</h2>
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 px-6 py-4 border border-slate-100/50">
          <StarDisplay rating={Math.round(stats.avg)} />
          <div className="text-xl font-black text-slate-900">
            {stats.avg.toFixed(1)} <span className="text-sm font-semibold text-slate-400">/ 5</span>
          </div>
          <div className="ml-2 border-l-2 border-slate-200 pl-4 text-sm font-bold text-slate-500">
            총 <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">{stats.total}</span>개의 생생한 리뷰
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {reviews.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mb-6 text-6xl opacity-30">📷</div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">아직 등록된 생생한 포토 리뷰가 없습니다!</h3>
            <p className="text-[0.95rem] font-medium text-slate-500">이 상품의 첫 번째 리뷰어가 되어 다른 분들에게 솔직한 후기를 공유해주세요.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div 
              key={review._id} 
              className="flex w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:border-blue-100 hover:shadow-lg sm:p-8"
            >
              <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 font-black text-blue-600 ring-4 ring-blue-50/50">
                    {review.userName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-bold tracking-tight text-slate-900">{review.userName}</div>
                    <div className="mt-1 text-xs font-semibold tracking-wider text-slate-400">
                      {review.createdAt.substring(0, 10).replace(/-/g, '.')}
                    </div>
                  </div>
                </div>
                <div className="rounded-full bg-slate-50 px-4 py-2 ring-1 ring-slate-100">
                  <StarDisplay rating={review.rating} />
                </div>
              </div>
              
              <div className="flex flex-col gap-8 md:flex-row">
                <p className="flex-1 whitespace-pre-wrap break-keep text-[1.05rem] leading-relaxed text-slate-700">
                  {review.content}
                </p>

                {review.image && (
                  <div className="h-64 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-100 shadow-sm md:h-48 md:w-48 lg:h-64 lg:w-64">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={review.image} 
                      alt="포토 리뷰" 
                      className="h-full w-full bg-slate-50 object-cover transition-transform hover:scale-105" 
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
