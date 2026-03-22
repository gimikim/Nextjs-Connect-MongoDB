import { getMyReviews } from '@/app/actions/review'
import ReviewListClient from './ReviewListClient'

export const dynamic = 'force-dynamic'

export default async function MyReviewsPage() {
  const result = await getMyReviews()
  const reviews = result.success && result.reviews ? result.reviews : []

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8 flex items-end border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">나의 리뷰 관리</h1>
      </div>
      <ReviewListClient initialReviews={reviews} />
    </div>
  )
}
