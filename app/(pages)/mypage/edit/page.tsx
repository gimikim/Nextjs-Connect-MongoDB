import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'

import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import EditProfileClient from './EditProfileClient'

export default async function EditProfilePage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) redirect('/auth?type=login')

  let decoded: { userId: string }
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    decoded = jwt.verify(token, jwtSecret) as { userId: string }
  } catch {
    redirect('/auth?type=login')
  }

  await dbConnect()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (await User.findById(decoded.userId).lean()) as any

  if (!user) redirect('/auth?type=login')

  const serializedUser = {
    username: user.username || '',
    name: user.name || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    user_type: user.user_type || user.accountType || 'personal',
    companyName: user.companyName || '',
    businessNumber: user.businessNumber || '',
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8 flex items-end justify-between border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">기본 정보 수정</h1>
      </div>
      <EditProfileClient user={serializedUser} />
    </div>
  )
}
