'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styled from 'styled-components'

type AccountType = 'personal' | 'business'
type Gender = 'male' | 'female' | 'other'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormState {
  name: string
  email: string
  birthDate: string
  gender: Gender
  phoneNumber: string
  username: string
  password: string
  confirmPassword: string
  address: string
  marketingConsent: boolean
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
  username: '',
  password: '',
  confirmPassword: '',
  address: '',
  marketingConsent: false,
  accountType: 'personal',
  companyName: '',
  businessNumber: '',
  emailCode: '',
}

export default function SignUp() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(initialForm)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameChecked, setUsernameChecked] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')

  const passwordLengthValid = form.password.length >= 8 && form.password.length <= 15
  const passwordMatched = form.password.length > 0 && form.password === form.confirmPassword
  const emailValid = EMAIL_REGEX.test(form.email)
  const passwordLengthMessage = passwordLengthValid
    ? '사용 가능한 비밀번호 길이입니다.'
    : '비밀번호는 8자 이상 15자 이하로 입력해 주세요.'
  const passwordMatchMessage = passwordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))

    if (key === 'username') {
      setUsernameChecked('')
      setUsernameAvailable(false)
      setUsernameMessage('')
    }

    if (key === 'email') {
      setEmailVerified(false)
      setEmailMessage('')
    }
  }

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
      const result = await response.json()

      setUsernameChecked(form.username)
      setUsernameAvailable(Boolean(result.available))
      setUsernameMessage(result.message)
    } catch {
      setUsernameAvailable(false)
      setUsernameMessage('아이디 중복 확인 중 오류가 발생했습니다.')
    } finally {
      setIsCheckingUsername(false)
    }
  }

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

      setEmailMessage(
        `인증 코드가 발급되었습니다. 현재 개발 환경에서는 확인용 코드 ${result.devCode} 를 사용해 주세요.`
      )
    } catch {
      setEmailMessage('이메일 인증 요청 중 오류가 발생했습니다.')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!form.emailCode.trim()) {
      setEmailMessage('이메일로 받은 인증 코드를 입력해 주세요.')
      return
    }

    setIsVerifyingEmail(true)

    try {
      const response = await fetch('/api/signup/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: form.emailCode }),
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

  const validateBeforeSubmit = () => {
    if (
      !form.name ||
      !form.email ||
      !form.birthDate ||
      !form.gender ||
      !form.phoneNumber ||
      !form.username ||
      !form.password ||
      !form.confirmPassword ||
      !form.address
    ) {
      return '필수 항목을 모두 입력해 주세요.'
    }

    if (!emailValid) {
      return '이메일 형식을 확인해 주세요.'
    }

    if (!passwordLengthValid) {
      return '비밀번호는 8자 이상 15자 이하로 입력해 주세요.'
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
          username: form.username,
          password: form.password,
          address: form.address,
          marketingConsent: form.marketingConsent,
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

      router.push('/auth?type=login')
    } catch {
      setSubmitMessage('회원가입 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SignUpBox>
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

      <Grid>
        <InputField
          type="text"
          placeholder="이름"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        <InputField
          type="date"
          placeholder="생년월일"
          value={form.birthDate}
          onChange={(e) => updateField('birthDate', e.target.value)}
        />
      </Grid>

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
        <label>
          <input
            type="radio"
            name="gender"
            value="other"
            checked={form.gender === 'other'}
            onChange={() => updateField('gender', 'other')}
          />
          기타
        </label>
      </RadioRow>

      <InputField
        type="tel"
        placeholder="전화번호"
        value={form.phoneNumber}
        onChange={(e) => updateField('phoneNumber', e.target.value)}
      />

      <InlineField>
        <InputField
          type="text"
          placeholder="아이디"
          value={form.username}
          onChange={(e) => updateField('username', e.target.value)}
        />
        <ActionButton type="button" onClick={handleCheckUsername} disabled={isCheckingUsername}>
          {isCheckingUsername ? '확인 중' : '중복 확인'}
        </ActionButton>
      </InlineField>
      {usernameMessage ? <HelperText $success={usernameAvailable}>{usernameMessage}</HelperText> : null}

      <InlineField>
        <InputField
          type="email"
          placeholder="이메일"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
        <ActionButton type="button" onClick={handleSendVerification} disabled={isSendingCode}>
          {isSendingCode ? '전송 중' : '이메일 인증'}
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

      <InputField
        type="password"
        placeholder="비밀번호"
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
      />
      {form.password ? <HelperText $success={passwordLengthValid}>{passwordLengthMessage}</HelperText> : null}

      <InputField
        type="password"
        placeholder="비밀번호 확인"
        value={form.confirmPassword}
        onChange={(e) => updateField('confirmPassword', e.target.value)}
      />
      {form.confirmPassword ? <HelperText $success={passwordMatched}>{passwordMatchMessage}</HelperText> : null}

      <InputField
        type="text"
        placeholder="기본 배송지"
        value={form.address}
        onChange={(e) => updateField('address', e.target.value)}
      />

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

      <CheckboxRow>
        <input
          id="marketing"
          type="checkbox"
          checked={form.marketingConsent}
          onChange={(e) => updateField('marketingConsent', e.target.checked)}
        />
        <label htmlFor="marketing">마케팅 수신에 동의합니다.</label>
      </CheckboxRow>

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
  width: min(720px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: white;
  padding: 2rem;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const ChoiceRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
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

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const InputField = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  font-size: 0.95rem;
  background-color: #f8fafc;
  color: #0f172a;
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

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;
  color: #334155;
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
