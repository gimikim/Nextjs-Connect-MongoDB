'use client'

import { useState } from 'react'
import styled from 'styled-components'

export default function ForgetPassword() {
  // 아이디 찾기와 비밀번호 찾기 모드를 전환하기 위한 상태입니다.
  const [activeTab, setActiveTab] = useState<'findId' | 'resetPw'>('findId')

  // 사용자가 입력할 이름과 이메일 상태를 관리합니다.
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  // 에러 또는 성공 알림 메시지
  const [message, setMessage] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 1. 아이디 찾기 버튼 클릭 시 동작하는 함수
  const handleFindId = async () => {
    setMessage('')
    setSuccessMsg('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccessMsg(data.message)
      } else {
        setMessage(data.message || '가입된 계정을 찾을 수 없습니다.')
      }
    } catch {
      setMessage('서버 연동 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 2. 비밀번호 재설정 버튼 클릭 시 동작하는 함수
  const handleResetPassword = async () => {
    setMessage('')
    setSuccessMsg('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccessMsg('성공적으로 재설정 안내를 전송했습니다. 이메일을 확인해 주세요.')
      } else {
        setMessage(data.message || '안내 링크 전송에 실패했습니다.')
      }
    } catch {
      setMessage('서버 연동 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 탭을 바꿀 때마다 깔끔하게 기존 메시지를 지워주는 헬퍼 함수입니다.
  const switchTab = (tab: 'findId' | 'resetPw') => {
    setActiveTab(tab)
    setMessage('')
    setSuccessMsg('')
  }

  return (
    <ContainerBox>
      <Logo>CONNECT</Logo>

      <TabContainer>
        <Tab $active={activeTab === 'findId'} onClick={() => switchTab('findId')}>
          아이디 찾기
        </Tab>
        <Tab $active={activeTab === 'resetPw'} onClick={() => switchTab('resetPw')}>
          비밀번호 찾기
        </Tab>
      </TabContainer>

      {activeTab === 'findId' ? (
        <>
          <Title>아이디 찾기</Title>
          <Subtitle>가입할 때 사용한 이름과 이메일을 입력하시면 바로 아이디를 알려드립니다.</Subtitle>
        </>
      ) : (
        <>
          <Title>비밀번호 재설정</Title>
          <Subtitle>가입할 때 사용한 이름과 이메일을 입력해 주세요.</Subtitle>
        </>
      )}

      <InputField type="text" placeholder="이름 입력" value={name} onChange={(e) => setName(e.target.value)} />
      <InputField type="email" placeholder="이메일 입력" value={email} onChange={(e) => setEmail(e.target.value)} />

      {message && <ErrorMessage>{message}</ErrorMessage>}

      {successMsg && <ResultBox>{successMsg}</ResultBox>}

      {activeTab === 'findId' ? (
        <SubmitButton onClick={handleFindId} disabled={isLoading}>
          {isLoading ? '조회 중...' : '아이디 찾기'}
        </SubmitButton>
      ) : (
        <SubmitButton onClick={handleResetPassword} disabled={isLoading}>
          {isLoading ? '안내 링크 전송...' : '재설정 링크 전송'}
        </SubmitButton>
      )}

      <BottomLinks>
        <a href="/auth?type=login">로그인 하러 가기</a>
      </BottomLinks>
    </ContainerBox>
  )
}

const ContainerBox = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 420px;
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

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
`

const Tab = styled.div<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  color: ${(props) => (props.$active ? '#0f172a' : '#94a3b8')};
  border-bottom: ${(props) => (props.$active ? '3px solid #0f172a' : '3px solid transparent')};
  margin-bottom: -2px;
  transition: all 0.2s ease;

  &:hover {
    color: #0f172a;
  }
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
  line-height: 1.4;
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.8rem;
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

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.85rem;
  margin-top: 0.5rem;
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

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.5rem;
  text-align: center;
`

const ResultBox = styled.div`
  margin: 1rem 0;
  padding: 1.25rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 1.05rem;
  font-weight: 500;
`

const BottomLinks = styled.div`
  margin-top: 1.5rem;
  font-size: 0.95rem;

  a {
    color: #64748b;
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  a:hover {
    color: #0f172a;
  }
`
