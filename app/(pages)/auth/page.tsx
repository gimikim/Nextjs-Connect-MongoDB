'use client'

import { useState, Suspense } from 'react'
import styled from 'styled-components'
import SignUp from './Signup'
import ForgetPassword from './ForgetPass'
import { useSearchParams } from 'next/navigation'

function AuthContent() {
  // URL의 쿼리 파라미터(?type=값)를 읽어와서 화면 모드를 결정합니다.
  // 기본값은 'login' 화면입니다.
  const searchParams = useSearchParams()
  const type = searchParams.get('type') ?? 'login'

  // 로그인 폼에 입력되는 아이디, 비밀번호, 역할(일반/사업자) 상태를 관리합니다.
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('personal')

  // 백엔드 로그인 API로 사용자 정보를 보내 인증을 시도하는 핸들러입니다.
  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role }),
    })

    if (res.ok) {
      alert('로그인에 성공했습니다.')
    } else {
      alert('로그인에 실패했습니다.')
    }
  }

  return (
    <Container>
      {type === 'login' && (
        <LoginBox>
          <Logo>CONNECT</Logo>
          <Title>환영합니다!</Title>
          <Subtitle>회원 유형을 선택해 주세요.</Subtitle>

          <RoleSelect>
            <label>
              <input
                type="radio"
                name="role"
                value="personal"
                checked={role === 'personal'}
                onChange={(e) => setRole(e.target.value)}
              />
              일반 회원
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="business"
                checked={role === 'business'}
                onChange={(e) => setRole(e.target.value)}
              />
              사업자 회원
            </label>
          </RoleSelect>

          <InputField
            type="email"
            placeholder="이메일"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputField
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <LoginButton onClick={handleLogin}>로그인</LoginButton>

          <Links>
            <a href="/auth?type=forgetpass">비밀번호를 잊으셨나요?</a>
            <p>
              아직 계정이 없으신가요? <a href="/auth?type=sign-up">회원가입</a>
            </p>
          </Links>
        </LoginBox>
      )}

      {type === 'sign-up' && <SignUp />}

      {type === 'forgetpass' && <ForgetPassword />}
    </Container>
  )
}

// 인증 관련 전체 화면을 담당하는 최상위 페이지 컴포넌트입니다.
// Next.js 13+ 앱 라우터 환경에서 클라이언트 사이드의 useSearchParams를 사용할 때는
// 빌드 오류 방지를 위해 React의 Suspense로 감싸주어야 합니다.
export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: #f0f4f8;
`

const LoginBox = styled.div`
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
  color: #0f172a; /* 선명해지도록 진한 검정색 추가 */
`

const Subtitle = styled.p`
  color: #475569; /* 부제목도 조금 더 선명한 색상으로 조정 */
  margin-bottom: 1.5rem;
`

const RoleSelect = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;

  label {
    margin: 0 1rem;
    font-size: 1rem;
    color: #0f172a; /* 라디오 버튼의 글자를 진한 검정색으로 지정 */
  }
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
  color: #0f172a; /* 입력하는 글자 색상을 어두운 검정색으로 설정 */
`

const LoginButton = styled.button`
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

const Links = styled.div`
  margin-top: 1rem;

  a {
    color: #3182ce;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`
