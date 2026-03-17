import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import EmailVerification from '@/db/models/emailVerification'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: '올바른 이메일 형식을 입력해 주세요.' }, { status: 400 })
  }

  await dbConnect()

  const code = String(crypto.randomInt(100000, 1000000))
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5)

  await EmailVerification.findOneAndUpdate(
    { email },
    {
      email,
      codeHash: hashCode(code),
      expiresAt,
      verified: false,
      verifiedAt: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return NextResponse.json({
    message: '인증 코드가 발급되었습니다.',
    expiresAt,
    devCode: code,
  })
}
