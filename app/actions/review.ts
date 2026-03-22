'use server'

import dbConnect from '@/db/dbConnect'
import Review from '@/db/models/review'
import Order from '@/db/models/order'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'

export async function submitReview(formData: FormData) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) {
    return { success: false, message: '로그인이 필요합니다.' }
  }

  let userId: string
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    userId = decoded.userId
  } catch {
    return { success: false, message: '인증 세션이 만료되었습니다.' }
  }

  try {
    await dbConnect()

    const orderId = formData.get('orderId') as string
    const productId = Number(formData.get('productId'))
    const rating = Number(formData.get('rating'))
    const content = formData.get('content') as string
    const imageFile = formData.get('image') as File | null

    let imageUrl = ''
    if (imageFile && imageFile.size > 0) {
      // 이미지 저장 (public/uploads 디렉토리 활용)
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reviews')
      
      // 디렉토리가 없으면 생성
      try {
        await fs.access(uploadDir)
      } catch {
        await fs.mkdir(uploadDir, { recursive: true })
      }
      
      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const filePath = path.join(uploadDir, fileName)
      await fs.writeFile(filePath, buffer)
      imageUrl = `/uploads/reviews/${fileName}`
    }

    // 1. 주문 내역이 실제로 사용자의 것인지, 그리고 리뷰 작성이 안 된 상태인지 확인
    const order = await Order.findOne({ _id: orderId, userId })
    if (!order) {
      return { success: false, message: '해당 주문 내역을 찾을 수 없거나 권한이 없습니다.' }
    }

    const orderItem = order.items.find((item: any) => item.productId === productId)
    if (!orderItem) {
      return { success: false, message: '주문 내역에 해당 상품이 존재하지 않습니다.' }
    }

    if (orderItem.isReviewed) {
      return { success: false, message: '이미 리뷰가 작성된 상품입니다.' }
    }

    // 2. 리뷰 데이터베이스에 생성
    await Review.create({
      userId,
      productId: productId,
      orderId: orderId,
      rating: rating,
      content: content,
      image: imageUrl || undefined,
    })

    // 3. 주문 항목의 isReviewed 플래그를 true로 업데이트
    orderItem.isReviewed = true
    await order.save()

    return { success: true, message: '리뷰가 정상적으로 등록되었습니다.' }
  } catch (error: any) {
    console.error('[Review Submit Error]', error)
    return { success: false, message: '리뷰 저장 중 서버 오류가 발생했습니다.' }
  }
}

// 상품 상세 페이지에서 리뷰 데이터를 불러오는 함수
export async function getReviews(productId: number) {
  try {
    await dbConnect()
    
    // 외래 키 연결을 위해 런타임에 User 모델이 등록되어 있는지 확인 차 가져옴 (없으면 자동 등록 됨)
    require('@/db/models/user')

    const reviews = await Review.find({ productId }).populate('userId', 'name').sort({ createdAt: -1 }).lean()
    
    const totalReviews = reviews.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avgRating = totalReviews > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
      : '0'
      
    // 이름 마스킹 (홍결동 -> 홍*동) 및 직렬화
    const serializedReviews = reviews.map(r => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userName = (r.userId as any)?.name || '알수없음'
      const maskedName = userName.length > 2 
        ? userName[0] + '*'.repeat(userName.length - 2) + userName[userName.length - 1]
        : userName[0] + '*'
        
      return {
        _id: r._id.toString(),
        rating: r.rating,
        content: r.content,
        image: r.image,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: (r.createdAt as any).toISOString(),
        userName: maskedName
      }
    })

    return { success: true, stats: { total: totalReviews, avg: Number(avgRating) }, reviews: serializedReviews }
  } catch (error) {
    console.error('[getReviews Error]', error)
    return { success: false, message: '리뷰를 불러오는 중 서버 오류가 발생했습니다.' }
  }
}
