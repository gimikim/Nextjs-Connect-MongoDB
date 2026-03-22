import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  productId: number
  name: string
  brand: string
  price: number
  discount: number
  finalPrice: number
  quantity: number
  image: string
  color?: string
  size?: string
  isReviewed?: boolean
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId | string
  orderNumber: string // e.g. "ORD-2026-12345"
  items: IOrderItem[]
  totalAmount: number
  status: '결제완료' | '상품준비중' | '배송중' | '배송완료' | '주문취소'
  shippingAddress: string
  recipientName: string
  recipientPhone: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema({
  productId: { type: Number, required: true },
  name: { type: String, required: true },
  brand: { type: String, required: false },
  price: { type: Number, required: true },
  discount: { type: Number, required: false },
  finalPrice: { type: Number, required: false },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  color: { type: String, required: false },
  size: { type: String, required: false },
  isReviewed: { type: Boolean, default: false },
})

const OrderSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['결제완료', '상품준비중', '배송중', '배송완료', '주문취소'],
      default: '결제완료',
    },
    shippingAddress: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// 개발 환경의 HMR (핫 모듈 리플레이스먼트) 시 이전 스키마 캐시된 객체를 지우고 새 규격 적용
if (mongoose.models.Order) {
  delete mongoose.models.Order
}

export default mongoose.model<IOrder>('Order', OrderSchema)

