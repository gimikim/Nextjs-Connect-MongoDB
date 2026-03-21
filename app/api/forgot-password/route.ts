import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import PasswordReset from '@/db/models/passwordReset'
import { sendPasswordResetEmail } from '@/lib/mailer'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * DB에 저장하기 전, 토큰 값을 단방향으로 해싱(암호화)하는 함수입니다.
 * 만약 데이터베이스 내용이 유출되더라도 진짜 재설정 링크(토큰값)를 알 수 없도록 방어하는 역할을 합니다.
 */
function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * 사용자가 "코드 전송"(또는 비밀번호 초기화 메일 전송)을 클릭했을 때 작동하는 API입니다.
 * 임시 비밀번호가 아닌, 고유한 토큰이 포함된 '재설정 링크'를 생성하여 전송합니다.
 */
export async function POST(req: NextRequest) {
  const { name, email } = await req.json()

  // 1. 이름 및 이메일 값 누락 및 형식 불량 검사
  if (!name || !email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: '올바른 이름과 이메일 형식을 입력해 주세요.' }, { status: 400 })
  }

  try {
    // 2. DB 연결
    await dbConnect()

    // 3. 실제 존재하는 유저인지 이름과 이메일 둘 다 일치하는 조건으로 검색
    const user = await User.findOne({ name, email })

    // 만약 사용자가 없다면 보안(해킹 방지)을 위해
    // 똑같이 404를 반환하되 안내 문구를 직관적으로 표기
    if (!user) {
      return NextResponse.json({ message: '가입된 이름이랑 이메일이 일치하지 않습니다.' }, { status: 404 })
    }
    // 4. 매우 긴 64바이트 무작위(Random) 토큰을 생성합니다. (임시 비밀번호가 아닌 접속용 열쇠)
    const resetToken = crypto.randomBytes(32).toString('hex')

    // 보안을 위해 이 토큰을 그대로 저장하지 않고 한 번 해싱합니다.
    const tokenHash = hashToken(resetToken)

    // 토큰의 만료 시간을 현재 시각 기준 10분(60,000ms * 10) 뒤로 설정
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // 5. DB에 저장 (기존 해당 이메일로 발급된 토큰이 있다면 삭제하고 새로 생성)
    // findOneAndUpdate의 upsert 옵션 대신 확실하게 이전 데이터를 지우고 새로 생성합니다.
    await PasswordReset.deleteMany({ email })
    await PasswordReset.create({
      email,
      tokenHash,
      expiresAt,
    })

    // 6. 이메일 전송용 URL을 조합합니다.
    // 사용자가 메일을 클릭할 때, 주소창 뒤에 고유 열쇠(?token=...)가 달리게 됩니다.
    // 주의: 실제 서비스 런칭 시에는 localhost가 아닌 실제 도메인 주소(process.env.NEXT_PUBLIC_CLIENT_URL 등)로 변경해야 합니다.
    const appUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const resetLink = `${appUrl}/auth?type=reset-password&token=${resetToken}&email=${encodeURIComponent(email)}`

    // 7. 메일러를 호출해 이메일 전송
    await sendPasswordResetEmail({ email, name: user.name, resetLink })

    return NextResponse.json({ message: '재설정 안내 링크를 전송했습니다.' })
  } catch (error) {
    console.error('Failed to process forgot password:', error)
    return NextResponse.json({ message: '재설정 메일 발송 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
