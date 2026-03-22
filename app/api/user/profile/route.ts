import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

function hashPassword(password: string) {
  return crypto.pbkdf2Sync(password, 'signup-salt', 1000, 64, 'sha512').toString('hex')
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-string-only-for-development'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }

    const body = await req.json()
    const { password, address, companyName, businessNumber, username, email } = body

    await dbConnect()

    if (username) {
      const existingUser = await User.findOne({ username })
      if (existingUser && existingUser._id.toString() !== decoded.userId) {
        return NextResponse.json(
          { message: '이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.' },
          { status: 400 }
        )
      }
    }

    if (email) {
      const existingEmail = await User.findOne({ email })
      if (existingEmail && existingEmail._id.toString() !== decoded.userId) {
        return NextResponse.json(
          { message: '이미 가입된 이메일 주소입니다. 다른 이메일을 입력해 주세요.' },
          { status: 400 }
        )
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (password && password.trim() !== '') {
      updateData.passwordHash = hashPassword(password)
    }
    if (address) updateData.address = address
    if (companyName !== undefined) updateData.companyName = companyName
    if (businessNumber !== undefined) updateData.businessNumber = businessNumber

    const updatedUser = await User.findByIdAndUpdate(decoded.userId, updateData, { new: true })

    if (!updatedUser) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ message: '회원 정보가 성공적으로 수정되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
