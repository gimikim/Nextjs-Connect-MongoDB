import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  productId: number;
  name: string;
  brand: string;
  price: number;
  discount: number;
  finalPrice: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId | string;
  orderNumber: string; // e.g. "ORD-2026-12345"
  items: IOrderItem[];
  totalAmount: number;
  status: '결제완료' | '상품준비중' | '배송중' | '배송완료' | '주문취소';
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Number, required: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
});

const OrderSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
