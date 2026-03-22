'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useState } from 'react'
import styled from 'styled-components'
import {
  getPasswordValidationMessage,
  isPasswordLengthValid,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from '@/lib/passwordValidation'

type AccountType = 'personal' | 'business'
type Gender = 'male' | 'female'

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormState {
  name: string
  email: string
  birthDate: string
  gender: Gender
  phoneNumber: string
  address: string
  username: string
  password: string
  confirmPassword: string
  accountType: AccountType
  companyName: string
  businessNumber: string
  emailCode: string
}

const initialForm: FormState = {
  name: '',
  email: '',
  birthDate: '',
  gender: 'male',
  phoneNumber: '',
  address: '',
  username: '',
  password: '',
  confirmPassword: '',
  accountType: 'personal',
  companyName: '',
  businessNumber: '',
  emailCode: '',
}

export default function SignUp() {
  const router = useRouter() // 페이지 이동을 위한 Next.js 라우터

  // 폼 입력 상태를 하나로 관리하기 위한 useState 객체
  const [form, setForm] = useState<FormState>(initialForm)

  // 로딩 및 중복 확인, 인증 여부 등 UI 상태 관리를 위한 state들
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [usernameChecked, setUsernameChecked] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')

  const passwordLengthValid = isPasswordLengthValid(form.password)
  const passwordValidationMessage = getPasswordValidationMessage(form.password, form.username)
  const passwordValid = form.password.length > 0 && !passwordValidationMessage
  const passwordMatched = form.password.length > 0 && form.password === form.confirmPassword
  const emailValid = EMAIL_REGEX.test(form.email)
  const passwordLengthMessage = passwordValid
    ? '사용 가능한 비밀번호입니다.'
    : passwordValidationMessage || PASSWORD_REQUIREMENTS_MESSAGE
  const passwordMatchMessage = passwordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'

  // 입력 필드의 값이 변경될 때마다 폼 상태를 업데이트해주는 공통 함수
  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    let finalValue = value

    // 전화번호 실시간 하이픈 형변환
    if (key === 'phoneNumber' && typeof value === 'string') {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 3) {
        finalValue = digits as FormState[K]
      } else if (digits.length <= 7) {
        finalValue = `${digits.slice(0, 3)}-${digits.slice(3)}` as FormState[K]
      } else {
        finalValue = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}` as FormState[K]
      }
    }

    setForm((prev) => ({ ...prev, [key]: finalValue }))

    if (key === 'username') {
      setUsernameChecked('')
      setUsernameAvailable(false)
      setUsernameMessage('')
    }

    if (key === 'email') {
      setEmailVerified(false)
      setEmailMessage('')
    }

    if (key === 'address') {
      setSubmitMessage('')
    }
  }

  // 아이디 중복을 백엔드 API를 통해 확인하는 핸들러
  // 사용자가 입력한 아이디가 DB에 이미 있는지 검사합니다.
  const handleCheckUsername = async () => {
    if (!form.username.trim()) {
      setUsernameMessage('아이디를 입력해 주세요.')
      setUsernameAvailable(false)
      return
    }

    setIsCheckingUsername(true)
    setUsernameMessage('')

    try {
      const response = await fetch(`/api/signup/check-username?username=${encodeURIComponent(form.username)}`)
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        setUsernameChecked('')
        setUsernameAvailable(false)
        setUsernameMessage(result?.message ?? '아이디 중복 확인 중 오류가 발생했습니다.')
        return
      }

      setUsernameChecked(form.username)
      setUsernameAvailable(Boolean(result?.available))
      setUsernameMessage(result?.message ?? '아이디 중복 확인이 완료되었습니다.')
    } catch {
      setUsernameChecked('')
      setUsernameAvailable(false)
      setUsernameMessage('아이디 중복 확인 중 오류가 발생했습니다.')
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // 사용자의 이메일 주소로 6자리 보안 인증 코드를 발송하는 핸들러
  const handleSendVerification = async () => {
    if (!emailValid) {
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

  // 사용자가 이메일로 받은 코드를 입력 후 인증을 요청하는 핸들러
  // 백엔드에서 입력된 코드와 만료 기간을 검증합니다.
  const handleVerifyEmail = async () => {
    const normalizedCode = form.emailCode.trim()

    if (!normalizedCode) {
      setEmailMessage('이메일로 받은 인증 코드를 입력해 주세요.')
      return
    }

    setIsVerifyingEmail(true)

    try {
      const response = await fetch('/api/signup/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: normalizedCode }),
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

  // 다음(Daum) 우편번호 API를 호출하여 주소 검색 팝업을 띄우는 함수
  const handleSearchAddress = () => {
    setSubmitMessage('')

    if (!window.daum?.Postcode) {
      setSubmitMessage('주소 검색 서비스를 아직 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      return
    }

    setIsSearchingAddress(true)

    new window.daum.Postcode({
      oncomplete: (data) => {
        const extraAddress = data.addressType === 'R' ? [data.bname, data.buildingName].filter(Boolean).join(', ') : ''

        updateField('address', extraAddress ? `${data.address} (${extraAddress})` : data.address)
        setIsSearchingAddress(false)
      },
    }).open()
  }

  // 폼 제출(회원가입 완료) 전 모든 필수 값을 입력했는지 및 유효성 검사를 수행하는 함수
  // 빈 문자열이 반환되면 오류가 없는 것입니다.
  const validateBeforeSubmit = () => {
    if (
      !form.name ||
      !form.email ||
      !form.birthDate ||
      !form.gender ||
      !form.phoneNumber ||
      !form.address ||
      !form.username ||
      !form.password ||
      !form.confirmPassword
    ) {
      return '필수 항목을 모두 입력해 주세요.'
    }

    if (!emailValid) {
      return '이메일 형식을 확인해 주세요.'
    }

    if (!passwordLengthValid || passwordValidationMessage) {
      return passwordValidationMessage || PASSWORD_REQUIREMENTS_MESSAGE
    }

    if (!passwordMatched) {
      return '비밀번호가 일치하지 않습니다.'
    }

    if (!usernameAvailable || usernameChecked !== form.username) {
      return '아이디 중복 확인을 완료해 주세요.'
    }

    if (!emailVerified) {
      return '이메일 인증을 완료해 주세요.'
    }

    if (form.accountType === 'business' && (!form.companyName || !form.businessNumber)) {
      return '사업자 회원은 회사명과 사업자등록번호를 입력해 주세요.'
    }

    return ''
  }

  // 최종적으로 입력된 데이터를 모아 백엔드의 회원가입 API(/api/signup)로 전송하는 핸들러
  const handleSignUp = async () => {
    const validationMessage = validateBeforeSubmit()
    if (validationMessage) {
      setSubmitMessage(validationMessage)
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          birthDate: form.birthDate,
          gender: form.gender,
          phoneNumber: form.phoneNumber,
          address: form.address,
          username: form.username,
          password: form.password,
          accountType: form.accountType,
          companyName: form.companyName,
          businessNumber: form.businessNumber,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setSubmitMessage(result.message ?? '회원가입에 실패했습니다.')
        return
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push('/auth?type=login')
    } catch {
      setSubmitMessage('회원가입 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SignUpBox>
      <Script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />
      <LogoWrap>CONNECT</LogoWrap>
      <Title>회원가입</Title>
      <Subtitle>일반 회원과 사업자 회원 모두 가입할 수 있습니다.</Subtitle>

      <SectionTitle>가입 유형</SectionTitle>
      <ChoiceRow>
        <ChoiceButton
          type="button"
          $active={form.accountType === 'personal'}
          onClick={() => updateField('accountType', 'personal')}
        >
          일반 회원
        </ChoiceButton>
        <ChoiceButton
          type="button"
          $active={form.accountType === 'business'}
          onClick={() => updateField('accountType', 'business')}
        >
          사업자 회원
        </ChoiceButton>
      </ChoiceRow>

      <FormStack>
        <FieldLabel>생년월일</FieldLabel>
        <InputField
          type="date"
          placeholder="생년월일"
          value={form.birthDate}
          onChange={(e) => updateField('birthDate', e.target.value)}
        />
      </FormStack>

      <SectionTitle>성별</SectionTitle>
      <RadioRow>
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={form.gender === 'male'}
            onChange={() => updateField('gender', 'male')}
          />
          남성
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={form.gender === 'female'}
            onChange={() => updateField('gender', 'female')}
          />
          여성
        </label>
      </RadioRow>

      <InlineField>
        <InputField type="text" placeholder="기본 배송지" value={form.address} readOnly />
        <ActionButton type="button" onClick={handleSearchAddress} disabled={isSearchingAddress}>
          {isSearchingAddress ? '검색 중' : '주소 검색'}
        </ActionButton>
      </InlineField>

      <FormStack>
        <FieldLabel>ID</FieldLabel>
        <InlineField>
          <InputField
            type="text"
            placeholder="아이디"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            autoComplete="off"
          />
          <ActionButton type="button" onClick={handleCheckUsername} disabled={isCheckingUsername}>
            {isCheckingUsername ? '확인 중' : '중복 확인'}
          </ActionButton>
        </InlineField>
        {usernameMessage ? <HelperText $success={usernameAvailable}>{usernameMessage}</HelperText> : null}

        <FieldLabel>비밀번호</FieldLabel>
        <InputField
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          autoComplete="new-password"
        />
        {form.password ? <HelperText $success={passwordValid}>{passwordLengthMessage}</HelperText> : null}

        <FieldLabel>비밀번호 확인</FieldLabel>
        <InputField
          type="password"
          placeholder="비밀번호 확인"
          value={form.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          autoComplete="new-password"
        />
        {form.confirmPassword ? <HelperText $success={passwordMatched}>{passwordMatchMessage}</HelperText> : null}

        <FieldLabel>이름</FieldLabel>
        <InputField
          type="text"
          placeholder="이름"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
        />

        <FieldLabel>휴대폰 번호</FieldLabel>
        <InputField
          type="tel"
          placeholder="전화번호"
          value={form.phoneNumber}
          onChange={(e) => updateField('phoneNumber', e.target.value)}
          maxLength={13}
        />

        <FieldLabel>이메일 인증</FieldLabel>
        <InlineField>
          <InputField
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <ActionButton type="button" onClick={handleSendVerification} disabled={isSendingCode}>
            {isSendingCode ? '전송 중' : '인증 요청'}
          </ActionButton>
        </InlineField>

        <InlineField>
          <InputField
            type="text"
            placeholder="인증 코드 입력"
            value={form.emailCode}
            onChange={(e) => updateField('emailCode', e.target.value)}
          />
          <ActionButton type="button" onClick={handleVerifyEmail} disabled={isVerifyingEmail}>
            {isVerifyingEmail ? '확인 중' : '인증 확인'}
          </ActionButton>
        </InlineField>
        {emailMessage ? <HelperText $success={emailVerified}>{emailMessage}</HelperText> : null}
      </FormStack>

      {form.accountType === 'business' ? (
        <>
          <InputField
            type="text"
            placeholder="회사명"
            value={form.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
          />
          <InputField
            type="text"
            placeholder="사업자등록번호"
            value={form.businessNumber}
            onChange={(e) => updateField('businessNumber', e.target.value)}
          />
        </>
      ) : null}

      {submitMessage ? <SubmitMessage>{submitMessage}</SubmitMessage> : null}

      <SignUpButton type="button" onClick={handleSignUp} disabled={isSubmitting}>
        {isSubmitting ? '가입 중...' : '회원가입 완료'}
      </SignUpButton>

      <Links>
        <Link href="/auth?type=login">이미 계정이 있나요? 로그인하기</Link>
      </Links>
    </SignUpBox>
  )
}

const SignUpBox = styled.div`
  width: min(680px, calc(100vw - 40px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: white;
  padding: 2.25rem;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
`

const LogoWrap = styled.div`
  width: 120px;
  margin: 0 auto 1rem;
  padding: 0.75rem 0;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.08em;
`

const Title = styled.h2`
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #0f172a;
`

const Subtitle = styled.p`
  color: #64748b;
  text-align: center;
  margin-bottom: 1.5rem;
`

const SectionTitle = styled.p`
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
  margin: 1rem 0 0.75rem;
`

const ChoiceRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  width: calc(100% - 12px);
  margin: 0 auto;
`

const ChoiceButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${(props) => (props.$active ? '#0f172a' : '#cbd5e1')};
  background: ${(props) => (props.$active ? '#0f172a' : '#fff')};
  color: ${(props) => (props.$active ? '#fff' : '#0f172a')};
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  cursor: pointer;
`

const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin: 1.25rem 0;
  padding: 1.1rem 0.4rem 0.2rem;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
`

const FieldLabel = styled.label`
  display: block;
  margin: 0 0 0.45rem 0.35rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
`

const RadioRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: #334155;
  }
`

const InlineField = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 0.75rem;
  align-items: start;
  width: calc(100% - 12px);
  margin: 0 auto;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    width: 100%;
  }
`

const InputField = styled.input`
  width: calc(100% - 12px);
  padding: 0.85rem 1rem;
  margin: 0 auto 0.75rem;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: #f8fafc;
  color: #0f172a;

  @media (max-width: 640px) {
    width: 100%;
  }
`

const ActionButton = styled.button`
  width: 100%;
  padding: 0.85rem 0.75rem;
  border: none;
  border-radius: 10px;
  background: #1d4ed8;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`

const HelperText = styled.p<{ $success: boolean }>`
  margin: -0.3rem 0 0.8rem;
  color: ${(props) => (props.$success ? '#15803d' : '#dc2626')};
  font-size: 0.85rem;
`

const SubmitMessage = styled.p`
  margin-bottom: 1rem;
  color: #dc2626;
  font-size: 0.9rem;
`

const SignUpButton = styled.button`
  width: 100%;
  padding: 0.95rem;
  background-color: #0f172a;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`

const Links = styled.div`
  margin-top: 1rem;
  text-align: center;

  a {
    color: #2563eb;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`
