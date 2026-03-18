import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import EmailVerification from '@/db/models/emailVerification'
import User from '@/db/models/user'
import { getPasswordValidationMessage } from '@/lib/passwordValidation'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 비밀번호를 안전하게 저장하기 위해 암호화(해싱)하는 함수입니다.
// Node.js의 내장 crypto 모듈을 사용하며, pbkdf2 알고리즘으로 암호화합니다.
function hashPassword(password: string) {
  return crypto.pbkdf2Sync(password, 'signup-salt', 1000, 64, 'sha512').toString('hex')
}

// 회원가입 요청을 처리하는 POST API 핸들러입니다.
export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    name,
    email,
    birthDate,
    gender,
    phoneNumber,
    address,
    username,
    password,
    accountType,
    companyName,
    businessNumber,
  } = body

  // 필수 항목 누락 여부를 검사합니다.
  if (!name || !email || !birthDate || !gender || !phoneNumber || !address || !username || !password) {
    return NextResponse.json({ message: '필수 항목을 모두 입력해 주세요.' }, { status: 400 })
  }

  // 이메일 형식이 잘못되었는지 검사합니다.
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: '이메일 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  const passwordValidationMessage = getPasswordValidationMessage(password, username)

  if (passwordValidationMessage) {
    return NextResponse.json({ message: passwordValidationMessage }, { status: 400 })
  }

  // 데이터베이스에 연결합니다.
  await dbConnect()

  // 이메일 또는 아이디가 이미 존재하는지 여부와 이메일 인증이 완료되었는지를 비동기로 동시에 확인합니다.
  const [existingUser, verification] = await Promise.all([
    User.findOne({
      $or: [{ email }, { username }],
    }).lean(),
    EmailVerification.findOne({ email }),
  ])

  // 중복된 회원이 있는 경우 에러 반환
  if (existingUser) {
    return NextResponse.json({ message: '이미 가입된 이메일 또는 아이디입니다.' }, { status: 409 })
  }

  // 이메일 인증이 되지 않았다면 에러 반환
  if (!verification?.verified) {
    return NextResponse.json({ message: '이메일 인증을 완료해 주세요.' }, { status: 400 })
  }

  // 모든 검증이 완료되었으므로 새 사용자 데이터를 DB에 저장(생성)합니다.
  await User.create({
    name,
    email,
    nickname: username,
    user_type: accountType === 'business' ? 'business' : 'personal',
    birthDate,
    gender,
    phoneNumber,
    address,
    username,
    passwordHash: hashPassword(password),
    accountType: accountType === 'business' ? 'business' : 'personal',
    companyName: accountType === 'business' ? (companyName ?? '') : '',
    businessNumber: accountType === 'business' ? (businessNumber ?? '') : '',
    emailVerified: true,
    emailVerifiedAt: verification.verifiedAt ?? new Date(),
  })

  // 회원가입 성공 시, 사용된 이메일 인증 코드는 더 이상 필요 없으므로 삭제합니다.
  await EmailVerification.deleteOne({ email })

  return NextResponse.json({ message: '회원가입이 완료되었습니다.' }, { status: 201 })
}
