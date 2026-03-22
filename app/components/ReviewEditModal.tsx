'use client'

import { useState } from 'react'
import { updateReview } from '@/app/actions/review'

interface ReviewEditModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  review: any
  onClose: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (updated: any) => void
}

export default function ReviewEditModal({ review, onClose, onUpdate }: ReviewEditModalProps) {
  const [rating, setRating] = useState(review.rating)
  const [content, setContent] = useState(review.content)
  const [imageFile, setImageFile] = useState<File | null | 'delete'>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(review.image || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하만 업로드 가능합니다.')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleDeleteImage = () => {
    setImageFile('delete')
    setImagePreview(null)
  }

  const handleSubmit = async () => {
    if (!content.trim() || content.length < 10) {
      alert('솔직한 리뷰를 10자 이상 작성해주세요.')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('reviewId', review._id)
    formData.append('rating', rating.toString())
    formData.append('content', content)
    if (imageFile === 'delete') {
      formData.append('image', 'delete')
    } else if (imageFile) {
      formData.append('image', imageFile)
    }

    const result = await updateReview(formData)
    setIsSubmitting(false)

    if (result.success) {
      alert(result.message)
      if (imageFile !== null && imageFile !== 'delete') {
        window.location.reload() // 파일명 채번으로 인한 강제 새로고침 동기화
      } else {
        onUpdate({
          ...review,
          rating,
          content,
          image: imageFile === 'delete' ? undefined : review.image,
        })
      }
    } else {
      alert(result.message || '수정에 실패했습니다.')
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="animate-in zoom-in-95 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
          <h3 className="text-xl font-black text-slate-900">리뷰 수정</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-slate-300 hover:text-slate-900"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-8">
          <p className="mb-6 block break-keep text-center text-[0.95rem] font-bold leading-relaxed text-blue-600">
            {review.productName || '상품'}
          </p>

          <div className="mb-8 flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-5xl drop-shadow-sm transition-all hover:scale-110 active:scale-90 ${
                  rating >= star ? 'text-yellow-400' : 'text-slate-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상품에 대한 상세하고 솔직한 평가를 최소 10자 이상 남겨주세요."
            className="mb-6 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 text-[0.95rem] text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            rows={4}
          />

          <div className="mb-8">
            <label className="mb-2 block text-sm font-bold text-slate-700">사진 첨부 (선택)</label>
            <div className="flex items-center gap-4">
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500">
                <span className="text-2xl font-black">+</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                  <button
                    onClick={handleDeleteImage}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white shadow-sm hover:bg-black"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-lg transition hover:bg-black active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? '수정 사항 저장 중...' : '리뷰 수정 완료'}
          </button>
        </div>
      </div>
    </div>
  )
}
