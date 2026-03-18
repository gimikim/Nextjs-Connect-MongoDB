'use client'

import { useState } from 'react'
import styled from 'styled-components'

export default function ForgetPassword() {
  // 사용자가 입력할 이메일 상태를 관리합니다.
  const [email, setEmail] = useState('')

  // 비밀번호 재설정 이메일을 전송하도록 백엔드 API에 요청하는 함수입니다.
  const handleSendCode = async () => {
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      alert('재설정 안내를 전송했습니다.')
    } else {
      alert('재설정 안내 전송에 실패했습니다.')
    }
  }

  return (
    <ForgetPasswordBox>
      <Logo>CONNECT</Logo>
      <Title>비밀번호를 잊으셨나요?</Title>
      <Subtitle>가입한 이메일을 입력하면 비밀번호 재설정 절차를 진행할 수 있습니다.</Subtitle>

      <InputField type="email" placeholder="이메일 입력" value={email} onChange={(e) => setEmail(e.target.value)} />

      <SendCodeButton onClick={handleSendCode}>Send code</SendCodeButton>
    </ForgetPasswordBox>
  )
}

const ForgetPasswordBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 350px;
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
`

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
`

const SendCodeButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #1a202c;
  }
`
