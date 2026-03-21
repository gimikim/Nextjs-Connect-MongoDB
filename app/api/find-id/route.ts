import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import { sendFindIdEmail } from '@/lib/mailer'

/**
 * 이름과 이메일을 받아서 가입된 아이디(username)를 찾아 반환해 주는 간이 API입니다.
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json()

    // 1. 필수 값 누락 검사
    if (!name || !email) {
      return NextResponse.json({ message: '이름과 이메일을 모두 입력해 주세요.' }, { status: 400 })
    }

    // 2. DB 연결 및 조회
    await dbConnect()

    const user = await User.findOne({ name, email })

    // 3. 검증 결과에 따라 에러/응답 반환
    if (!user) {
      return NextResponse.json({ message: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 보안을 위해 화면에 직접 아이디를 노출하지 않고 가입된 이메일로 전송합니다.
    await sendFindIdEmail({ email: user.email, name: user.name, username: user.username })

    return NextResponse.json({ message: '가입하신 이메일로 아이디를 전송했습니다.' })
  } catch (error) {
    console.error('Find ID error:', error)
    return NextResponse.json({ message: '아이디 조회 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
