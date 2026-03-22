import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId | string
  productId: number
  orderId: string
  rating: number
  content: string
  image?: string
  createdAt: Date
}

const ReviewSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Number, required: true },
    orderId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    image: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// 개발 환경의 HMR(핫 모듈 리플레이스먼트) 캐시 초기화
if (mongoose.models.Review) {
  delete mongoose.models.Review
}

export default mongoose.model<IReview>('Review', ReviewSchema)
