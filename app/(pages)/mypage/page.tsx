import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (await User.findById(decoded.userId).lean()) as any

  if (!user) {
    redirect('/auth?type=login')
  }

  const isBusiness = user.user_type === 'business' || user.accountType === 'business'

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-extrabold text-slate-900">📝 내 기본 정보 요약</h3>

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

      {isBusiness && (
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-sm">
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

      <div className="mb-4">
        <Link
          href="/mypage/edit"
          className="inline-flex rounded-full bg-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-300"
        >
          ⚙️ 내 정보 자세히 수정하러 가기
        </Link>
      </div>
    </div>
  )
}
