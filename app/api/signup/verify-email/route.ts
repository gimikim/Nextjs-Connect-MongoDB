import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import EmailVerification from '@/db/models/emailVerification'

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json({ message: '이메일과 인증 코드를 모두 입력해 주세요.' }, { status: 400 })
  }

  await dbConnect()

  const verification = await EmailVerification.findOne({ email })

  if (!verification) {
    return NextResponse.json({ message: '인증 요청을 먼저 진행해 주세요.' }, { status: 404 })
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ message: '인증 코드가 만료되었습니다.' }, { status: 400 })
  }

  if (verification.codeHash !== hashCode(code)) {
    return NextResponse.json({ message: '인증 코드가 일치하지 않습니다.' }, { status: 400 })
  }

  verification.verified = true
  verification.verifiedAt = new Date()
  await verification.save()

  return NextResponse.json({ verified: true, message: '이메일 인증이 완료되었습니다.' })
}
