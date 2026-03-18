import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import EmailVerification from '@/db/models/emailVerification'

// DB에 저장된 해싱 코드와 비교하기 위해 사용자가 입력한 코드를 해시 처리하는 함수입니다.
function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

// 사용자가 입력한 인증 코드가 일치하는지 검증하는 POST API 핸들러입니다.
export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json({ message: '이메일과 인증 코드를 모두 입력해 주세요.' }, { status: 400 })
  }

  await dbConnect()

  // 이전에 인증 요청(send-verification)을 보내 DB에 저장된 데이터가 있는지 확인합니다.
  const verification = await EmailVerification.findOne({ email })

  if (!verification) {
    return NextResponse.json({ message: '인증 요청을 먼저 진행해 주세요.' }, { status: 404 })
  }

  // 인증 만료 기간이 지나지 않았는지 확인합니다.
  if (verification.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ message: '인증 코드가 만료되었습니다.' }, { status: 400 })
  }

  // 해시 변환한 코드가 DB의 저장된 값과 동일한지 일치 여부를 검사합니다.
  if (verification.codeHash !== hashCode(code)) {
    return NextResponse.json({ message: '인증 코드가 일치하지 않습니다.' }, { status: 400 })
  }

  // 코드가 모두 일치하면 인증 상태를 true로 변경하고 성공 응답을 보냅니다.
  verification.verified = true
  verification.verifiedAt = new Date()
  await verification.save()

  return NextResponse.json({ verified: true, message: '이메일 인증이 완료되었습니다.' })
}
