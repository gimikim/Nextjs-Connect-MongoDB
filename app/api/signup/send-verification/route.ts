import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import EmailVerification from '@/db/models/emailVerification'
import { sendVerificationEmail } from '@/lib/mailer'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 보안을 위해 인증 코드를 해싱하여 DB에 저장합니다. (사용자가 입력한 코드와 나중에 비교)
function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

// 이메일 인증 코드를 생성해서 발송하고 DB에 기록하는 POST API 핸들러입니다.
export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: '올바른 이메일 형식을 입력해 주세요.' }, { status: 400 })
  }

  // 무작위 6자리 숫자 코드를 생성합니다.
  const code = String(crypto.randomInt(100000, 1000000))
  // 만료 시간은 현재 시간으로부터 5분(1000ms * 60 * 5) 뒤로 설정합니다.
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5)

  try {
    await dbConnect()

    // 해당 이메일로 발급된 기존 인증 정보가 있다면 수정하고, 없으면 새로 생성(upsert)합니다.
    await EmailVerification.findOneAndUpdate(
      { email },
      {
        email,
        codeHash: hashCode(code), // 해싱된 코드를 저장
        expiresAt,
        verified: false,
        verifiedAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // 메일러를 이용해 실제 이메일 전송
    await sendVerificationEmail({ email, code })
  } catch (error) {
    console.error('Failed to send verification email:', error)

    return NextResponse.json({ message: '인증 메일 전송에 실패했습니다. SMTP 설정을 확인해 주세요.' }, { status: 500 })
  }

  return NextResponse.json({
    message: '인증 메일을 전송했습니다. 이메일을 확인해 주세요.',
    expiresAt,
  })
}
