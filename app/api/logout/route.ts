import { NextResponse } from 'next/server'

// 로그아웃을 처리하는 API입니다. 브라우저에서 'auth_token' 쿠키를 강제로 삭제시킵니다.
export async function POST() {
  const response = NextResponse.json({ message: '로그아웃 성공' })

  // 쿠키 만료(삭제) 명령을 응답에 담아 보냅니다.
  response.cookies.delete('auth_token')

  return response
}
