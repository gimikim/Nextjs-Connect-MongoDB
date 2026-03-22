import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
            CONNECT
          </Link>
          <div className="text-[0.95rem] font-bold text-slate-600">
            <Link href="/mypage" className="flex items-center gap-2 transition hover:text-black">
              <span>←</span> 마이페이지로 이동
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">회원 정보 수정</h1>
        <EditProfileClient user={serializedUser} />
      </main>
    </div>
  )
}
