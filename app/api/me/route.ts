import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// 클라이언트가 페이지를 열 때, "나 지금 로그인 되어있어?"를 묻는 API입니다.
export async function GET(req: NextRequest) {
  // 1. 브라우저가 자동으로 보낸 HTTP-Only 쿠키에서 'auth_token'을 꺼냅니다.
  const token = req.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ message: '로그인되지 않았습니다.' }, { status: 401 })
  }

  try {
    // 2. 토큰이 위조되지 않았고 만료되지 않았는지 비밀키로 검증합니다.
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret)

    // 3. 검증에 성공하면 토큰 안에 들어있던 사용자 정보를 내려줍니다.
    return NextResponse.json({ user: decoded })
  } catch {
    return NextResponse.json({ message: '유효하지 않거나 만료된 쿠키입니다.' }, { status: 401 })
  }
}
