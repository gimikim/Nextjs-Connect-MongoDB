'use client'

import { useState } from 'react'
import { deleteReview } from '@/app/actions/review'
import ReviewEditModal from '@/app/components/ReviewEditModal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReviewListClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingReview, setEditingReview] = useState<any | null>(null)

  const handleDelete = async (reviewId: string) => {
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까? (삭제 후 복구할 수 없습니다)')) return

    const result = await deleteReview(reviewId)
    if (result.success) {
      setReviews(reviews.filter((r) => r._id !== reviewId))
    } else {
      alert(result.message || '삭제 처리에 실패했습니다.')
    }
  }

  // 간단 별점 포매팅 함수
  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div className="flex flex-col gap-6">
      {reviews.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white py-20 text-center text-slate-500 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="mb-4 text-5xl opacity-40">⭐</div>
          <p className="font-semibold text-slate-900">아직 작성하신 상품 리뷰가 없습니다.</p>
          <p className="mt-2 text-sm text-slate-500">구매하신 상품을 수령한 후 첫 리뷰를 남겨보세요!</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            className="flex flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:border-blue-100 hover:shadow-md sm:flex-row"
          >
            {/* 주문한 상품의 썸네일 */}
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              {review.productImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={review.productImage} alt="상품 썸네일" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">IMG</div>
              )}
            </div>

            {/* 메인 리뷰 리스트 데이터 컨테이너 */}
            <div className="flex flex-1 flex-col justify-center gap-3">
              <div className="flex items-center justify-between">
                <span className="max-w-[200px] truncate text-sm font-bold text-slate-400 sm:max-w-xs">
                  {review.productName}
                </span>
                <span className="rounded-md bg-slate-50 px-2 py-1 text-[0.7rem] font-extrabold tracking-wider text-slate-400">
                  {review.createdAt.substring(0, 10).replace(/-/g, '.')}
                </span>
              </div>
              <div className="flex items-center text-lg tracking-widest text-yellow-400 drop-shadow-sm">
                {renderStars(review.rating)}
              </div>
              <p className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-slate-700">
                {review.content}
              </p>

              {/* 이미지 연동 처리 공간 */}
              {review.image && (
                <div className="mt-2 h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition hover:scale-105">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={review.image} alt="첨부된 포토 리뷰" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            {/* 수정 삭제 버튼 조작부 영역 */}
            <div className="flex shrink-0 flex-row gap-3 border-t border-slate-100 pt-5 sm:w-28 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <button
                onClick={() => setEditingReview(review)}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-[0.8rem] font-black text-slate-600 transition hover:bg-slate-200 sm:flex-none"
              >
                수정하기
              </button>
              <button
                onClick={() => handleDelete(review._id)}
                className="flex-1 rounded-xl border border-red-100 bg-red-50 py-3 text-[0.8rem] font-black text-red-500 transition hover:bg-red-100 sm:flex-none"
              >
                삭제하기
              </button>
            </div>
          </div>
        ))
      )}

      {/* 포토 리뷰 등 단일 엔터티 수정 전용 모달 */}
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
