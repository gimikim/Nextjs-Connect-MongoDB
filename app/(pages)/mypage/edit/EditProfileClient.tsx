'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { getPasswordValidationMessage, PASSWORD_REQUIREMENTS_MESSAGE } from '@/lib/passwordValidation'

interface DaumPostcodeResult {
  address: string
  addressType: 'R' | 'J'
  bname: string
  buildingName: string
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeResult) => void }) => { open: () => void }
    }
  }
}

type UserData = {
  username: string
  name: string
  email: string
  phoneNumber: string
  address: string
  user_type: string
  companyName: string
  businessNumber: string
}

export default function EditProfileClient({ user }: { user: UserData }) {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isBusiness = user.user_type === 'business' || (user as any).accountType === 'business'

  const [form, setForm] = useState({
    username: user.username || '',
    name: user.name || '',
    email: user.email || '',
    emailCode: '',
    password: '',
    confirmPassword: '',
    phoneNumber: user.phoneNumber || '',
    address: user.address || '',
    companyName: user.companyName || '',
    businessNumber: user.businessNumber || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // 이메일 인증 상태
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')

  // 이메일이 초기 이메일과 다른지 여부 파악
  const isEmailChanged = form.email !== user.email

  const passwordValidationMessage = getPasswordValidationMessage(form.password, form.username)
  const passwordValid = form.password.length > 0 && !passwordValidationMessage
  const passwordMatched = form.password.length > 0 && form.password === form.confirmPassword
  const passwordLengthMessage = passwordValid
    ? '사용 가능한 비밀번호입니다.'
    : passwordValidationMessage || PASSWORD_REQUIREMENTS_MESSAGE
  const passwordMatchMessage = passwordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'

  const handleSearchAddress = () => {
    setErrorMsg('')
    if (!window.daum?.Postcode) {
      setErrorMsg('주소 검색 서비스를 아직 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    setIsSearchingAddress(true)
    new window.daum.Postcode({
      oncomplete: (data) => {
        const extraAddress = data.addressType === 'R' ? [data.bname, data.buildingName].filter(Boolean).join(', ') : ''
        setForm((prev) => ({ ...prev, address: extraAddress ? `${data.address} (${extraAddress})` : data.address }))
        setIsSearchingAddress(false)
      },
    }).open()
  }

  const handleSendVerification = async () => {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setEmailMessage('올바른 이메일 형식을 입력해 주세요.')
      return
    }
    setIsSendingCode(true)
    setEmailMessage('')
    try {
      const response = await fetch('/api/signup/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      })
      const result = await response.json()
      if (!response.ok) {
        setEmailMessage(result.message ?? '이메일 인증 요청에 실패했습니다.')
        return
      }
      setEmailMessage(result.message ?? '인증 메일을 전송했습니다. 이메일을 확인해 주세요.')
    } catch {
      setEmailMessage('이메일 인증 요청 중 오류가 발생했습니다.')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!form.emailCode.trim()) {
      setEmailMessage('인증 코드를 입력해 주세요.')
      return
    }
    setIsVerifyingEmail(true)
    try {
      const response = await fetch('/api/signup/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: form.emailCode.trim() }),
      })
      const result = await response.json()
      if (!response.ok) {
        setEmailVerified(false)
        setEmailMessage(result.message ?? '이메일 인증에 실패했습니다.')
        return
      }
      setEmailVerified(true)
      setEmailMessage(result.message)
    } catch {
      setEmailVerified(false)
      setEmailMessage('이메일 인증 중 오류가 발생했습니다.')
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setMessage('')

    if (form.password) {
      if (!passwordValid) {
        setErrorMsg(passwordLengthMessage)
        return
      }
      if (!passwordMatched) {
        setErrorMsg('비밀번호가 일치하지 않습니다.')
        return
      }
    }

    if (isEmailChanged && !emailVerified) {
      setErrorMsg('새로운 이메일로 변경하시려면 이메일 인증을 완료해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: isEmailChanged && emailVerified ? form.email : undefined,
          password: form.password,
          address: form.address,
          companyName: form.companyName,
          businessNumber: form.businessNumber,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('🎉 회원 정보가 성공적으로 수정되었습니다!')
        setTimeout(() => {
          router.push('/mypage')
          router.refresh()
        }, 1500)
      } else {
        setErrorMsg(data.message || '수정에 실패했습니다.')
      }
    } catch {
      setErrorMsg('서버 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-8">
          <h2 className="text-xl font-bold text-slate-900">핵심 정보 변경</h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            비밀번호를 변경하지 않으시려면 비밀번호 칸을 비워두세요.
          </p>
        </div>

        <div className="flex flex-col gap-6 p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">아이디</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 p-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-500">이름 (변경 불가)</label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">이메일</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, email: e.target.value }))
                    setEmailVerified(false)
                    setEmailMessage('')
                  }}
                  className="w-full flex-1 rounded-xl border border-slate-200 p-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {isEmailChanged && !emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={isSendingCode}
                    className="whitespace-nowrap rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                  >
                    {isSendingCode ? '전송 중' : '인증 요청'}
                  </button>
                )}
              </div>

              {isEmailChanged && !emailVerified && (
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="인증 코드 입력"
                    value={form.emailCode}
                    onChange={(e) => setForm((p) => ({ ...p, emailCode: e.target.value }))}
                    className="w-full flex-1 rounded-xl border border-slate-200 p-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isVerifyingEmail}
                    className="whitespace-nowrap rounded-xl bg-slate-800 px-8 py-4 font-bold text-white transition hover:bg-slate-700 focus:outline-none disabled:opacity-50"
                  >
                    {isVerifyingEmail ? '확인 중' : '인증 확인'}
                  </button>
                </div>
              )}
              {emailMessage && (
                <p className={`mt-2 text-[0.85rem] font-bold ${emailVerified ? 'text-green-600' : 'text-red-500'}`}>
                  {emailMessage}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-500">휴대폰 번호 (변경 불가)</label>
              <input
                type="tel"
                value={form.phoneNumber}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-500"
              />
            </div>
          </div>

          <hr className="my-4 border-slate-100" />

          {/* Editable Password & Address */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">새 비밀번호</label>
            <input
              type="password"
              placeholder="변경할 비밀번호를 입력해주세요"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 p-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {form.password && (
              <p className={`mt-2 text-[0.85rem] font-bold ${passwordValid ? 'text-green-600' : 'text-red-500'}`}>
                {passwordLengthMessage}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">새 비밀번호 확인</label>
            <input
              type="password"
              placeholder="위와 동일한 비밀번호를 입력해 주세요"
              value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 p-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {form.confirmPassword && (
              <p className={`mt-2 text-[0.85rem] font-bold ${passwordMatched ? 'text-green-600' : 'text-red-500'}`}>
                {passwordMatchMessage}
              </p>
            )}
          </div>

          <div className="mt-2 md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">기본 배송지</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="배송지를 검색하세요"
                value={form.address}
                readOnly
                className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={isSearchingAddress}
                className="whitespace-nowrap rounded-xl bg-slate-800 px-8 py-4 font-bold text-white transition hover:bg-slate-700 focus:outline-none disabled:opacity-50"
              >
                {isSearchingAddress ? '검색 중' : '주소 검색'}
              </button>
            </div>
          </div>

          {isBusiness && (
            <>
              <hr className="my-4 border-slate-100" />
              <div>
                <label className="mb-2 block text-sm font-bold text-blue-600">상호명 (회사명)</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                  className="w-full rounded-xl border border-blue-200 p-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-blue-600">사업자등록번호</label>
                <input
                  type="text"
                  value={form.businessNumber}
                  onChange={(e) => setForm((p) => ({ ...p, businessNumber: e.target.value }))}
                  className="w-full rounded-xl border border-blue-200 p-4 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {errorMsg && <p className="mt-4 text-center text-sm font-semibold text-red-500">{errorMsg}</p>}
          {message && <p className="mt-4 text-center text-[0.95rem] font-bold text-green-600">{message}</p>}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || (isEmailChanged && !emailVerified)}
              className="rounded-full bg-blue-600 px-10 py-4 font-bold text-white shadow-md transition hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '회원 정보 수정 완료'}
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
