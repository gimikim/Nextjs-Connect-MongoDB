import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import EmailVerification from '@/db/models/emailVerification'
import User from '@/db/models/user'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function hashPassword(password: string) {
  return crypto.pbkdf2Sync(password, 'signup-salt', 1000, 64, 'sha512').toString('hex')
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    name,
    email,
    birthDate,
    gender,
    phoneNumber,
    username,
    password,
    address,
    marketingConsent,
    accountType,
    companyName,
    businessNumber,
  } = body

  if (
    !name ||
    !email ||
    !birthDate ||
    !gender ||
    !phoneNumber ||
    !username ||
    !password ||
    !address
  ) {
    return NextResponse.json({ message: '필수 항목을 모두 입력해 주세요.' }, { status: 400 })
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: '이메일 형식이 올바르지 않습니다.' }, { status: 400 })
  }

  if (password.length < 8 || password.length > 15) {
    return NextResponse.json({ message: '비밀번호는 8자 이상 15자 이하로 입력해 주세요.' }, { status: 400 })
  }

  await dbConnect()

  const [existingUser, verification] = await Promise.all([
    User.findOne({
      $or: [{ email }, { username }],
    }).lean(),
    EmailVerification.findOne({ email }),
  ])

  if (existingUser) {
    return NextResponse.json({ message: '이미 가입된 이메일 또는 아이디입니다.' }, { status: 409 })
  }

  if (!verification?.verified) {
    return NextResponse.json({ message: '이메일 인증을 완료해 주세요.' }, { status: 400 })
  }

  await User.create({
    name,
    email,
    nickname: username,
    user_type: accountType === 'business' ? 'business' : 'personal',
    birthDate,
    gender,
    phoneNumber,
    username,
    passwordHash: hashPassword(password),
    address,
    marketingConsent: Boolean(marketingConsent),
    accountType: accountType === 'business' ? 'business' : 'personal',
    companyName: accountType === 'business' ? companyName ?? '' : '',
    businessNumber: accountType === 'business' ? businessNumber ?? '' : '',
    emailVerified: true,
    emailVerifiedAt: verification.verifiedAt ?? new Date(),
  })

  await EmailVerification.deleteOne({ email })

  return NextResponse.json({ message: '회원가입이 완료되었습니다.' }, { status: 201 })
}
