import { NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import Review from '@/db/models/review'
import Order from '@/db/models/order'
import Product from '@/db/models/product'

export async function GET() {
  await dbConnect()

  // 이름으로 진짜 상품 찾기
  const realProduct = await Product.findOne({ name: { $regex: '베이즈', $options: 'i' } }).lean()
  if (!realProduct) {
    return NextResponse.json({ message: '베이즈 자켓 원본을 찾을 수 없음' })
  }
  // 진짜 상품 ID 할당
  const realId = '69ca0cc6e07d130a26f4f4e7'

  const updatedReview = await Review.updateOne({ _id: '69ca137be07d130a26f4f586' }, { $set: { productId: realId } })

  const orderUpdate = await Order.updateOne(
    { _id: '69ca1221e07d130a26f4f55e', 'items.productId': 1774850593304 },
    { $set: { 'items.$.productId': realId } }
  )

  const orderUpdateStr = await Order.updateOne(
    { _id: '69ca1221e07d130a26f4f55e', 'items.productId': '1774850593304' },
    { $set: { 'items.$.productId': realId } }
  )

  return NextResponse.json({
    message: '복구 완료',
    realId,
    updatedReview,
    orderUpdate,
    orderUpdateStr,
  })
}
