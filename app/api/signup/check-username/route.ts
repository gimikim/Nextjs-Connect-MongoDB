import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')?.trim()

  if (!username) {
    return NextResponse.json({ available: false, message: '아이디를 입력해 주세요.' }, { status: 400 })
  }

  try {
    await dbConnect()

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
