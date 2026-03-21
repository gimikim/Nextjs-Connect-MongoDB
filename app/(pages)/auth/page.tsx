'use client'

import { useState, Suspense, useEffect } from 'react'
import styled from 'styled-components'
import SignUp from './Signup'
import ForgetPassword from './ForgetPass'
import ResetPassword from './ResetPassword'
import { useSearchParams } from 'next/navigation'

function AuthContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') ?? 'login'

  // 자동 로그인 테스트용 상태
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [loggedInUser, setLoggedInUser] = useState<{ username: string; role: string } | null>(null)

  // 로그인 폼에 입력되는 아이디, 비밀번호, 역할(일반/사업자) 등 상태를 관리합니다.
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('personal')
  const [autoLogin, setAutoLogin] = useState(false)

  // 화면이 처음 켜질 때 'auth_token' 쿠키가 살아있는지 검사합니다.
  useEffect(() => {
    fetch('/api/me')
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error('Not logged in')
      })
      .then((data) => {
        if (data.user) setLoggedInUser(data.user)
      })
      .catch(() => setLoggedInUser(null))
      .finally(() => setIsCheckingSession(false))
  }, [])

  // 백엔드 로그인 API로 사용자 정보를 보내 인증을 시도하는 핸들러입니다.
  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, role, autoLogin }),
    })

    const data = await res.json()

    if (res.ok) {
      alert(data.message || '로그인에 성공했습니다.')
      // 로그인 완료 시 내 정보를 상태에 업데이트하여 UI 즉시 전환
      setLoggedInUser(data.user)
    } else {
      alert(data.message || '로그인에 실패했습니다.')
    }
  }

  // 로그아웃 버튼
  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    setLoggedInUser(null)
    alert('로그아웃 되었습니다.')
  }

  if (isCheckingSession) {
    return (
      <Container>
        <LoginBox>
          <Subtitle>자동 로그인 상태를 확인 중입니다...</Subtitle>
        </LoginBox>
      </Container>
    )
  }

  // 이미 로그인(세션 유지) 상태라면, 로그인 폼 대신 환영 문구를 띄워줍니다.
  if (loggedInUser && type === 'login') {
    return (
      <Container>
        <LoginBox>
          <Logo>CONNECT</Logo>
          <Title>환영합니다!</Title>
          <Subtitle>
            현재 <strong>{loggedInUser.username}</strong> 계정으로
            <br />
            안전하게 로그인되어 있습니다.
          </Subtitle>
          <LoginButton onClick={handleLogout} style={{ marginTop: '2rem' }}>
            로그아웃
          </LoginButton>
        </LoginBox>
      </Container>
    )
  }

  return (
    <Container>
      {type === 'login' && (
        <LoginBox>
          <Logo>CONNECT</Logo>
          <Title>환영합니다!</Title>
          <Subtitle>회원 유형을 선택해 주세요.</Subtitle>

          <TabContainer>
            <Tab $active={role === 'personal'} onClick={() => setRole('personal')}>
              일반 회원
            </Tab>
            <Tab $active={role === 'business'} onClick={() => setRole('business')}>
              사업자 회원
            </Tab>
          </TabContainer>

          <InputField type="text" placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)} />
          <InputField
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <AutoLoginWrapper>
            <label>
              <input type="checkbox" checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)} />
              <span>자동 로그인</span>
            </label>
          </AutoLoginWrapper>

          <LoginButton onClick={handleLogin}>로그인</LoginButton>

          <Links>
            <a href="/auth?type=forgetpass">아이디/비밀번호 찾기</a>
            <p className="signup-prompt">
              아직 계정이 없으신가요? <a href="/auth?type=sign-up">회원가입</a>
            </p>
          </Links>
        </LoginBox>
      )}

      {type === 'sign-up' && <SignUp />}

      {type === 'forgetpass' && <ForgetPassword />}

      {type === 'reset-password' && <ResetPassword />}
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

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #0f172a; /* 선명해지도록 진한 검정색 추가 */
`

const Subtitle = styled.p`
  color: #475569; /* 부제목도 조금 더 선명한 색상으로 조정 */
  margin-bottom: 1.5rem;
`

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
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

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
  color: #0f172a; /* 입력하는 글자 색상을 어두운 검정색으로 설정 */
`

const AutoLoginWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1.5rem;
  margin-left: 0.2rem;

  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 0.9rem;
    color: #475569;
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    margin-right: 0.4rem;
    cursor: pointer;
    accent-color: #0f172a;
  }
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

  .signup-prompt {
    margin-top: 1rem;
    color: #1e293b;
    font-weight: 500;
  }
`
