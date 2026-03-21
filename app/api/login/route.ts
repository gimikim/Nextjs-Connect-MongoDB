import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

/**
 * 비밀번호가 맞는지 확인하기 위해, 사용자가 입력한 평문 비밀번호를
 * DB에 저장할 때와 똑같은 방식(PBKDF2)으로 암호화해 보는 함수입니다.
 */
function hashPassword(password: string) {
  return crypto.pbkdf2Sync(password, 'signup-salt', 1000, 64, 'sha512').toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { username, password, role, autoLogin } = await req.json()

    // 1. 필수 입력값 검사
    if (!username || !password) {
      return NextResponse.json({ message: '아이디와 비밀번호를 모두 입력해 주세요.' }, { status: 400 })
    }

    // 2. DB 연결
    await dbConnect()

    // 3. 오직 아이디(username)로만 사용자 검색
    const user = await User.findOne({ username })

    // 사용자가 없으면 실패
    if (!user) {
      return NextResponse.json({ message: '가입되지 않은 아이디입니다.' }, { status: 404 })
    }

    // 4. 회원 유형(일반/사업자) 일치 여부 확인
    // 스키마에 user_type과 accountType 두 개가 혼재되어 있으니 둘 다 검사합니다.
    const userRole = user.user_type || user.accountType
    if (userRole && userRole !== role) {
      const roleName = role === 'personal' ? '일반 회원' : '사업자 회원'
      return NextResponse.json({ message: `선택하신 [${roleName}] 유형의 계정이 아닙니다.` }, { status: 400 })
    }

    // 5. 비밀번호 일치 여부 확인
    const hashedInputPassword = hashPassword(password)
    if (user.passwordHash !== hashedInputPassword) {
      return NextResponse.json({ message: '비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    // 6. JWT 발급 및 브라우저 쿠키 설정
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'

    // 자동 로그인 여부에 따라 토큰 자체의 설정된 유효기간도 다르게 적용 (자동 로그인이면 30일, 아니면 1일)
    const token = jwt.sign({ userId: user._id, username: user.username, role: userRole }, jwtSecret, {
      expiresIn: autoLogin ? '30d' : '1d',
    })

    const response = NextResponse.json({
      message: '로그인에 성공했습니다.',
      user: {
        name: user.name,
        email: user.email,
        username: user.username,
        role: userRole,
      },
    })

    // HTTP-only 방식으로 안전하게 브라우저 쿠키에 구워냅니다.
    // 자동 로그인이 체크되어 있으면 maxAge를 30일로 설정하여 브라우저를 닫아도 유지되게 합니다.
    // 체크되어 있지 않으면 maxAge를 빼서 브라우저(세션) 종료 시 쿠키가 완전히 삭제되게 만듭니다.
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(autoLogin && { maxAge: 30 * 24 * 60 * 60 }), // 30일 (초 단위)
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: '로그인 처리 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
