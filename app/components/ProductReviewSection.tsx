'use client'

import { useEffect, useState } from 'react'
import { getReviews, deleteReview } from '@/app/actions/review'
import ReviewEditModal from '@/app/components/ReviewEditModal'

interface ReviewType {
  _id: string
  rating: number
  content: string
  image?: string
  createdAt: string
  userName: string
  isMine?: boolean
}

export default function ProductReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<ReviewType[]>([])
  const [stats, setStats] = useState({ total: 0, avg: 0 })
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<ReviewType | null>(null)
  const [sortType, setSortType] = useState<'latest' | 'best'>('latest')

  const handleDelete = async (reviewId: string) => {
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return

    const result = await deleteReview(reviewId)
    if (result.success) {
      setReviews(reviews.filter((r) => r._id !== reviewId))
      setStats((prev) => ({
        total: prev.total - 1,
        avg:
          prev.total > 1
            ? (prev.avg * prev.total - reviews.find((r) => r._id === reviewId)!.rating) / (prev.total - 1)
            : 0,
      }))
    } else {
      alert(result.message || '삭제에 실패했습니다.')
    }
  }

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
      <div className="mt-12 animate-pulse rounded-3xl bg-white/50 py-16 text-center text-sm font-bold text-slate-400">
        상품 리뷰를 안전하게 불러오고 있습니다...
      </div>
    )
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortType === 'best') {
      if (b.rating !== a.rating) return b.rating - a.rating
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="mt-12 w-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
      <div className="mb-10 flex flex-col items-center justify-between gap-4 border-b border-slate-100 pb-8 text-center sm:flex-row sm:text-left">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start sm:gap-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">상품 리뷰</h2>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100/50 bg-slate-50 px-6 py-4">
            <StarDisplay rating={Math.round(stats.avg)} />
            <div className="text-xl font-black text-slate-900">
              {stats.avg.toFixed(1)} <span className="text-sm font-semibold text-slate-400">/ 5</span>
            </div>
            <div className="ml-2 border-l-2 border-slate-200 pl-4 text-sm font-bold text-slate-500">
              총 <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">{stats.total}</span>
              개의 생생한 리뷰
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="flex shrink-0 gap-2 rounded-xl bg-slate-50 p-1">
            <button
              onClick={() => setSortType('latest')}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${sortType === 'latest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortType('best')}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${sortType === 'best' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              베스트순
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {reviews.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mb-6 text-6xl opacity-30">📷</div>
            <h3 className="mb-3 text-xl font-bold text-slate-900">아직 등록된 생생한 포토 리뷰가 없습니다!</h3>
            <p className="text-[0.95rem] font-medium text-slate-500">
              이 상품의 첫 번째 리뷰어가 되어 다른 분들에게 솔직한 후기를 공유해주세요.
            </p>
          </div>
        ) : (
          sortedReviews.map((review) => (
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
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-slate-50 px-4 py-2 ring-1 ring-slate-100">
                    <StarDisplay rating={review.rating} />
                  </div>
                  {review.isMine && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReview(review)}
                        className="rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-blue-50 hover:text-blue-500"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  )}
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

      {editingReview && (
        <ReviewEditModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onUpdate={(updatedReview) => {
            setReviews(reviews.map((r) => (r._id === updatedReview._id ? updatedReview : r)))
            setEditingReview(null)
          }}
        />
      )}
    </div>
  )
}
