import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import LogoutButton from '@/app/components/LogoutButton'

export default async function MyPage() {
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
  // lean()을 사용해 순수 자바스크립트 객체로 받아옵니다.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (await User.findById(decoded.userId).lean()) as any

  if (!user) {
    redirect('/auth?type=login')
  }

  const isBusiness = user.user_type === 'business' || user.accountType === 'business'

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">마이페이지</h1>

        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 shadow-inner">
                {user.name[0]}
              </div>
              <div>
                <h2 className="mb-0.5 text-xl font-bold text-slate-900">{user.name} 님</h2>
                <p className="text-[0.85rem] font-medium text-slate-500">
                  {isBusiness ? '🏢 사업자 회원' : '👤 일반 회원'}
                </p>
              </div>
            </div>
            <div>
              <LogoutButton />
            </div>
          </div>

          <div className="p-8">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">📝 내 정보 관리</h3>

            <div className="grid grid-cols-1 gap-x-10 gap-y-7 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-[0.85rem] font-bold text-slate-400">아이디</p>
                <p className="font-semibold text-slate-800">{user.username}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-[0.85rem] font-bold text-slate-400">이메일</p>
                <p className="truncate font-semibold text-slate-800" title={user.email}>
                  {user.email}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-[0.85rem] font-bold text-slate-400">휴대폰 번호</p>
                <p className="font-semibold text-slate-800">{user.phoneNumber}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-[0.85rem] font-bold text-slate-400">생년월일 / 성별</p>
                <p className="font-semibold text-slate-800">
                  {user.birthDate} ({user.gender === 'male' ? '남성' : '여성'})
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                <p className="mb-1 text-[0.85rem] font-bold text-slate-400">등록된 기본 배송지</p>
                <p className="break-keep font-semibold leading-snug text-slate-800">{user.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 조회 액션 버튼 */}
        <div className="mb-8">
          <Link
            href="/mypage/orders"
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900 p-8 text-white shadow-md transition hover:-translate-y-1 hover:bg-slate-800 hover:shadow-lg"
          >
            <span className="text-4xl">📦</span>
            <span className="text-[1.1rem] font-bold tracking-tight">주문 / 배송 조회</span>
          </Link>
        </div>

        {isBusiness && (
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-slate-900 text-white shadow-sm">
            <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="relative z-10 p-8">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-blue-400">🏢 비즈니스 인증 정보</h3>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[0.85rem] font-medium text-slate-400">상호명 (회사명)</p>
                  <p className="text-[1.1rem] font-semibold tracking-wide">{user.companyName}</p>
                </div>
                <div>
                  <p className="mb-1 text-[0.85rem] font-medium text-slate-400">사업자등록번호</p>
                  <p className="font-mono text-[1.1rem] font-semibold tracking-wide">{user.businessNumber}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/mypage/edit"
            className="rounded-full bg-slate-900 px-10 py-3.5 font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-slate-800 hover:shadow-lg"
          >
            내 정보 수정하기
          </Link>
        </div>
      </main>
    </div>
  )
}
