'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPasswordValidationMessage, PASSWORD_REQUIREMENTS_MESSAGE } from '@/lib/passwordValidation'

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 token과 email 정보를 가져옵니다.
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 비밀번호 안전성 검사 (아이디 부분이 필요하므로 이메일의 앞부분을 가상의 아이디로 사용합니다)
  const usernamePart = email.split('@')[0] || ''
  const passwordValidationMessage = getPasswordValidationMessage(password, usernamePart)
  const passwordValid = password.length > 0 && !passwordValidationMessage
  const passwordMatched = password.length > 0 && password === confirmPassword

  const handleSubmit = async () => {
    // 1. URL이 잘못되었는지 검사합니다.
    if (!token || !email) {
      setMessage('유효하지 않은 링크입니다. 이메일의 링크를 다시 확인해 주세요.')
      return
    }

    // 2. 비밀번호 규칙 검사
    if (!passwordValid) {
      setMessage(passwordValidationMessage || PASSWORD_REQUIREMENTS_MESSAGE)
      return
    }

    if (!passwordMatched) {
      setMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      // 3. 백엔드 API로 새 비밀번호 업데이트 요청을 보냅니다.
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해 주세요.')
        // 완료 후 로그인 화면으로 이동합니다.
        router.push('/auth?type=login')
      } else {
        setMessage(data.message || '비밀번호 재설정에 실패했습니다.')
      }
    } catch {
      setMessage('비밀번호 재설정 중 서버 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResetPasswordBox>
      <Logo>CONNECT</Logo>
      <Title>새 비밀번호 설정</Title>
      <Subtitle>보안 관리를 위해 새로운 비밀번호를 입력해 주세요.</Subtitle>

      <InputField
        type="password"
        placeholder="새 비밀번호 입력"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordRules $state={password.length === 0 ? 'empty' : passwordValid ? 'valid' : 'invalid'}>
        <li>영문/숫자/특수문자 2가지 이상 조합 (8~15자)</li>
        <li>3개 이상 연속되거나 동일한 문자/숫자 제외</li>
        <li>아이디(이메일) 제외</li>
      </PasswordRules>

      <InputField
        type="password"
        placeholder="비밀번호 다시 입력"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {confirmPassword ? (
        <HelperText $success={passwordMatched}>
          {passwordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
        </HelperText>
      ) : null}

      {message && <ErrorMessage>{message}</ErrorMessage>}

      <SubmitButton onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? '변경 중...' : '비밀번호 변경'}
      </SubmitButton>
    </ResetPasswordBox>
  )
}

// 스타일드 컴포넌트: 로그인 화면이나 회원가입 화면과 비슷한 깔끔한 스타일을 유지합니다.
const ResetPasswordBox = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 420px;
  text-align: center;
`

const Logo = styled.div`
  width: 100px;
  margin: 0 auto 1rem;
  padding: 0.65rem 0;
  border-radius: 999px;
  background: #0f172a;
  color: white;
  font-weight: 700;
  letter-spacing: 0.08em;
`

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #0f172a;
`

const Subtitle = styled.p`
  color: #475569;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
`

const PasswordRules = styled.ul<{ $state: 'empty' | 'invalid' | 'valid' }>`
  margin: 0.5rem 0 1.2rem 0.2rem;
  padding: 0;
  list-style: none;
  font-size: 0.88rem; /* 문구 크기를 더 크게 조정했습니다. */
  color: ${({ $state }) => ($state === 'valid' ? '#15803d' : $state === 'invalid' ? '#dc2626' : '#64748b')};
  text-align: left;
  line-height: 1.6;

  li::before {
    content: '•';
    color: ${({ $state }) => ($state === 'valid' ? '#15803d' : $state === 'invalid' ? '#dc2626' : '#94a3b8')};
    margin-right: 0.4rem;
  }
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #f9f9f9;
  color: #0f172a;

  &:focus {
    outline: none;
    border-color: #0f172a;
  }
`

const HelperText = styled.p<{ $success: boolean }>`
  margin: 0 0 1rem;
  text-align: left;
  color: ${(props) => (props.$success ? '#15803d' : '#dc2626')};
  font-size: 0.8rem;
  padding-left: 0.2rem;
`

const ErrorMessage = styled.div`
  margin-bottom: 1rem;
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.85rem;
  background-color: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;

  &:hover {
    background-color: #1e293b;
  }

  &:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
  }
`
