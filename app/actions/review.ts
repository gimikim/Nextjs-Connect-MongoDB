'use server'

import dbConnect from '@/db/dbConnect'
import Review from '@/db/models/review'
import Order from '@/db/models/order'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'
import { products } from '@/lib/data'

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
      const buffer = new Uint8Array(await imageFile.arrayBuffer())
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Review Submit Error]', error)
    return { success: false, message: '리뷰 저장 중 서버 오류가 발생했습니다.' }
  }
}

// 상품 상세 페이지에서 리뷰 데이터를 불러오는 함수
export async function getReviews(productId: number) {
  try {
    await dbConnect()

    // 외래 키 연결을 위해 런타임에 User 모델이 등록되어 있는지 확인 차 가져옴
    await import('@/db/models/user')

    // 현재 사용자 확인 (isMine 처리를 위함)
    const cookieStore = cookies()
    const token = cookieStore.get('auth_token')?.value
    let currentUserId = null
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-string-only-for-development') as {
          userId: string
        }
        currentUserId = decoded.userId
      } catch {
        // 무시
      }
    }

    const reviews = await Review.find({ productId }).populate('userId', 'name').sort({ createdAt: -1 }).lean()

    const totalReviews = reviews.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '0'

    // 이름 마스킹 (홍결동 -> 홍*동) 및 직렬화
    const serializedReviews = reviews.map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userName = (r.userId as any)?.name || '알수없음'
      const maskedName =
        userName.length > 2
          ? userName[0] + '*'.repeat(userName.length - 2) + userName[userName.length - 1]
          : userName[0] + '*'

      return {
        _id: r._id.toString(),
        rating: r.rating,
        content: r.content,
        image: r.image,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isMine: currentUserId ? (r.userId as any)._id.toString() === currentUserId.toString() : false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: (r.createdAt as any).toISOString(),
        userName: maskedName,
      }
    })

    return { success: true, stats: { total: totalReviews, avg: Number(avgRating) }, reviews: serializedReviews }
  } catch (error) {
    console.error('[getReviews Error]', error)
    return { success: false, message: '리뷰를 불러오는 중 서버 오류가 발생했습니다.' }
  }
}

// 본인이 작성한 리뷰만 모아보기
export async function getMyReviews() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return { success: false, message: '로그인이 필요합니다.' }

  let userId: string
  try {
    userId = (
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-string-only-for-development') as { userId: string }
    ).userId
  } catch {
    return { success: false, message: '인증이 만료되었습니다.' }
  }

  try {
    await dbConnect()
    const reviews = await Review.find({ userId }).sort({ createdAt: -1 }).lean()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized = reviews.map((r: any) => {
      const productInfo = products.find((p) => p.id === r.productId) || { name: '알 수 없는 상품', image: '' }
      return {
        _id: r._id.toString(),
        productId: r.productId,
        orderId: r.orderId,
        rating: r.rating,
        content: r.content,
        image: r.image,
        productName: productInfo.name,
        productImage: productInfo.image,
        createdAt: r.createdAt.toISOString(),
      }
    })

    return { success: true, reviews: serialized }
  } catch (err) {
    console.error('[getMyReviews Error]', err)
    return { success: false, message: '리뷰를 불러오는 중 오류가 발생했습니다.' }
  }
}

// 지정된 리뷰 삭제하기
export async function deleteReview(reviewId: string) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return { success: false, message: '로그인이 필요합니다.' }

  let userId: string
  try {
    userId = (
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-string-only-for-development') as { userId: string }
    ).userId
  } catch {
    return { success: false, message: '인증이 만료되었습니다.' }
  }

  try {
    await dbConnect()
    const review = await Review.findOne({ _id: reviewId, userId })
    if (!review) {
      return { success: false, message: '유효한 리뷰를 찾을 수 없거나 삭제할 권한이 없습니다.' }
    }

    // 파일 로컬 디스크에서 안전 삭제 시도 (옵션)
    if (review.image) {
      try {
        const filePath = path.join(process.cwd(), 'public', review.image)
        await fs.unlink(filePath)
      } catch {
        // 이미 지워졌거나 없어도 무시
      }
    }

    // 주문 내역 isReviewed false 복구 작업
    const order = await Order.findById(review.orderId)
    if (order) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderItem = order.items.find((item: any) => item.productId === review.productId)
      if (orderItem) {
        orderItem.isReviewed = false
        await order.save()
      }
    }

    await Review.deleteOne({ _id: reviewId })
    return { success: true, message: '리뷰가 정상적으로 삭제되었습니다.' }
  } catch (err) {
    console.error('[deleteReview Error]', err)
    return { success: false, message: '삭제 중 서버 오류가 발생했습니다.' }
  }
}

// 지정된 리뷰 수정하기
export async function updateReview(formData: FormData) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token) return { success: false, message: '로그인이 필요합니다.' }

  let userId: string
  try {
    userId = (
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-string-only-for-development') as { userId: string }
    ).userId
  } catch {
    return { success: false, message: '인증이 만료되었습니다.' }
  }

  try {
    await dbConnect()

    const reviewId = formData.get('reviewId') as string
    const rating = Number(formData.get('rating'))
    const content = formData.get('content') as string
    const imageFile = formData.get('image') as File | null | string
    // imageFile이 문자열이면 "delete" 커맨드거나 기존 URL 유지의 경우일 수 있음.

    const review = await Review.findOne({ _id: reviewId, userId })
    if (!review) {
      return { success: false, message: '유효한 리뷰를 찾을 수 없거나 수정 권한이 없습니다.' }
    }

    review.rating = rating
    review.content = content

    if (imageFile === 'delete') {
      if (review.image) {
        try {
          await fs.unlink(path.join(process.cwd(), 'public', review.image))
        } catch {
          /* 무시 */
        }
        review.image = undefined
      }
    } else if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
      // 새 이미지 등록
      const buffer = new Uint8Array(await imageFile.arrayBuffer())
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'reviews')
      try {
        await fs.access(uploadDir)
      } catch {
        await fs.mkdir(uploadDir, { recursive: true })
      }

      const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const filePath = path.join(uploadDir, fileName)
      await fs.writeFile(filePath, buffer)
      review.image = `/uploads/reviews/${fileName}`
    }

    await review.save()
    return { success: true, message: '리뷰가 멋지게 수정되었습니다.' }
  } catch (err) {
    console.error('[updateReview Error]', err)
    return { success: false, message: '리뷰 업데이트 중 문제가 발생했습니다.' }
  }
}
