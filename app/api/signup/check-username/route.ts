import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

// 아이디(username) 중복을 체크하는 GET API 핸들러입니다.
export async function GET(req: NextRequest) {
  // 쿼리 파라미터에서 username 값을 추출하고 공백을 제거합니다.
  const username = req.nextUrl.searchParams.get('username')?.trim()

  if (!username) {
    return NextResponse.json({ available: false, message: '아이디를 입력해 주세요.' }, { status: 400 })
  }

  try {
    await dbConnect()

    // 해당 아이디를 가진 사용자가 데이터베이스에 이미 존재하는지 확인합니다(true/false).
    const existingUser = await User.exists({ username })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.',
    })
  } catch (error) {
    console.error('Failed to check username:', error)

    const detail = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      {
        available: false,
        message:
          process.env.NODE_ENV === 'development'
            ? `아이디 중복 확인 중 서버 오류가 발생했습니다. ${detail}`
            : '아이디 중복 확인 중 서버 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
