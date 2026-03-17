import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')?.trim()

  if (!username) {
    return NextResponse.json({ message: '아이디를 입력해 주세요.' }, { status: 400 })
  }

  await dbConnect()

  const existingUser = await User.findOne({ username }).lean()

  return NextResponse.json({
    available: !existingUser,
    message: existingUser ? '이미 사용 중인 아이디입니다.' : '사용 가능한 아이디입니다.',
  })
}
