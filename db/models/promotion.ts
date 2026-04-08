import mongoose, { Schema, Document } from 'mongoose'

// Promotion 문서에 대한 TypeScript 인터페이스
export interface IPromotion extends Document {
  title: string
  imageUrl: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Promotion 스키마 정의 (구매자 서버에 띄울 이벤트/기획전 배너 데이터)
const promotionSchema = new Schema<IPromotion>(
  {
    title: {
      type: String,
      required: [true, '프로모션 제목을 입력해주세요'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, '이미지 URL을 입력해주세요'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'promotions',
  }
)

// HMR 이슈 방지를 위한 캐시된 모델 지우기
if (mongoose.models.Promotion) {
  delete mongoose.models.Promotion
}

const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema)
export default Promotion
