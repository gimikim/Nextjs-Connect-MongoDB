'use server'

import dbConnect from '@/db/dbConnect'
import Order from '@/db/models/order'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processOrder(orderData: any) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  let userId = null

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
      const decoded = jwt.verify(token, jwtSecret) as { userId: string }
      userId = decoded.userId
    } catch {
      // 무시 (게스트 또는 토큰 만료)
    }
  }

  await dbConnect()

  // HMR 강제 리컴파일 및 강력한 기본값 할당
  console.log('--- RECOMPILE ACTION ---', new Date().toISOString())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedItems = (orderData.items || []).map((item: any) => {
    const defaultPrice = Number(item.price) || 0;
    const finalPrice = item.finalPrice ? Number(item.finalPrice) : defaultPrice;
    const discount = item.discount ? Number(item.discount) : 0;
    
    return {
      productId: Number(item.productId) || Date.now(),
      name: String(item.name || 'CONNECT 상품'),
      brand: String(item.brand || 'CONNECT'),
      price: defaultPrice,
      discount: discount,
      finalPrice: finalPrice,
      quantity: Number(item.quantity) || 1,
      image: String(item.image || ''),
      color: String(item.color || 'Free'),
      size: String(item.size || 'Free'),
    }
  })

  try {
    const newOrder = await Order.create({
      userId: userId, // 비회원일 경우 null이 허용됨
      orderNumber: orderData.orderId,
      items: formattedItems,
      totalAmount: Number(orderData.amount) || 0,
      recipientName: orderData.formData?.recipientName || '고객',
      recipientPhone: orderData.formData?.recipientPhone || '000-0000-0000',
      shippingAddress: orderData.formData?.shippingAddress || '주소 없음',
      status: '결제완료',
      paymentMethod: '카드결제',
    })

    // 반환 가능한 문자열/원시 타입으로 변환
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { success: true, orderId: String((newOrder as any)._id) }
  } catch (error: any) {
    // 중복 저장 방지 (리액트 StrictMode 이중 렌더링 또는 페이지 새로고침 대응)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.orderNumber) {
      console.log('[Server Action] Order already exists, returning gracefully.');
      const existingOrder = await Order.findOne({ orderNumber: orderData.orderId })
      if (existingOrder) {
        return { success: true, orderId: String(existingOrder._id) }
      }
    }

    console.error('[Mongoose ERROR]', error)
    return { 
      success: false, 
      error: error.message || String(error), 
      details: error.errors ? JSON.stringify(error.errors, null, 2) : 'No detailed validation errors available.',
      passedItems: formattedItems
    }
  }
}
