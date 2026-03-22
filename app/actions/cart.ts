'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

export interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
}

// 1. 현재 사용자 아이디를 추출하는 내부 유틸 (JWT 검증)
const getUserId = (): string | null => {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// 2. DB에서 장바구니 가져오기 (초기 마운트 병합 시점)
export async function getCartFromDB() {
  const userId = getUserId()
  // 비로그인 상태면 false 반환
  if (!userId) return { success: false, cart: [] }

  await dbConnect()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (await User.findById(userId).lean()) as any
  return { success: true, cart: user?.cart || [] }
}

// 3. 클라이언트 장바구니를 DB에 밀어넣기 (덮어쓰기 동기화)
export async function syncCartToDB(cartItems: CartItem[]) {
  const userId = getUserId()
  // 비로그인 상태면 동기화 스킵 (로컬 스토리지에만 저장 됨)
  if (!userId) return { success: false }

  await dbConnect()
  await User.findByIdAndUpdate(userId, { $set: { cart: cartItems } })
  return { success: true }
}
