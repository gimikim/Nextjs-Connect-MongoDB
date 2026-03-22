import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import CheckoutClient from './CheckoutClient'

export default async function CheckoutPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  let serializedUser = null

  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
      const decoded = jwt.verify(token, jwtSecret) as { userId: string }

      await dbConnect()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = (await User.findById(decoded.userId).lean()) as any

      if (user) {
        serializedUser = {
          name: user.name || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
        }
      }
    } catch {
      // 비로그인 (또는 토큰 만료) 상태 무시 => null 처리되어 게스트 결제로 진행 가능
    }
  }

  return <CheckoutClient user={serializedUser} />
}
