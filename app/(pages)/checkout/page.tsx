import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import CheckoutClient from './CheckoutClient'
import { redirect } from 'next/navigation'

export default async function CheckoutPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    redirect('/auth?type=login')
  }

  let serializedUser = null

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
    } else {
      redirect('/auth?type=login')
    }
  } catch {
    redirect('/auth?type=login')
  }

  return <CheckoutClient user={serializedUser} />
}
