'use client'

import { useState } from 'react'
import { submitReview } from '@/app/actions/review'

interface ReviewButtonProps {
  orderId: string
  productId: number
  itemName: string
  isReviewed: boolean
}

export default function ReviewButton({
  orderId,
  productId,
  itemName,
  isReviewed: initialIsReviewed,
}: ReviewButtonProps) {
  const [isReviewed, setIsReviewed] = useState(initialIsReviewed)
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isReviewed) {
    return (
      <span className="inline-block rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
        리뷰 작성 완료
      </span>
    )
  }

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

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.')
      return
    }
    if (content.length < 10) {
      alert('솔직한 리뷰를 10자 이상 작성해주세요.')
      return
    }

    setIsSubmitting(true)

    // Server Action에 FormData 사용
    const formData = new FormData()
    formData.append('orderId', orderId)
    formData.append('productId', productId.toString())
    formData.append('rating', rating.toString())
    formData.append('content', content)
    if (imageFile) {
      formData.append('image', imageFile)
    }

    const result = await submitReview(formData)
    setIsSubmitting(false)

    if (result.success) {
      alert(result.message)
      setIsReviewed(true)
      setIsOpen(false)
    } else {
      alert(result.message || '리뷰 등록에 실패했습니다.')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-600 shadow-sm transition hover:bg-blue-100 active:scale-95"
      >
        리뷰 작성하기
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="animate-in zoom-in-95 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
              <h3 className="text-xl font-black text-slate-900">리뷰 작성</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-slate-300 hover:text-slate-900"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-8">
              <p className="mb-6 break-keep text-center text-[0.95rem] font-bold leading-relaxed text-slate-600">
                <strong className="mb-1 block text-blue-600">{itemName}</strong>
                상품을 받아보시니 어땠나요?
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
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
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
                {isSubmitting ? '안전하게 등록 중입니다...' : '리뷰 등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
