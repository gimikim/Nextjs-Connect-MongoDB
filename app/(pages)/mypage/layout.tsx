import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'

import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import LogoutButton from '@/app/components/LogoutButton'
import MyPageNav from '@/app/components/MyPageNav'

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    redirect('/auth?type=login')
  }

  let decoded: { userId: string }
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    decoded = jwt.verify(token, jwtSecret) as { userId: string }
  } catch {
    redirect('/auth?type=login')
  }

  await dbConnect()
  const user = await User.findById(decoded.userId).lean()

  if (!user) {
    redirect('/auth?type=login')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userData = user as any
  const isBusiness = userData.user_type === 'business' || userData.accountType === 'business'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900 md:mb-12">마이페이지</h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* 좌측 사이드바 */}
          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center border-b border-slate-100 bg-slate-50/50 p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-black text-blue-600 shadow-inner">
                  {userData.name[0]}
                </div>
                <h2 className="mb-1 text-[1.15rem] font-bold text-slate-900">{userData.name} 님</h2>
                <p className="mb-5 text-[0.8rem] font-bold tracking-wide text-slate-400">
                  {isBusiness ? '🏢 비즈니스 회원' : '👤 일반 회원'}
                </p>
                <div className="w-full">
                  <LogoutButton />
                </div>
              </div>

              <MyPageNav />
            </div>
          </aside>

          {/* 우측 메인 콘텐츠 영역 */}
          <main className="w-full flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
