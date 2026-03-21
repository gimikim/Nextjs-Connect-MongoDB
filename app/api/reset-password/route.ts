import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import PasswordReset from '@/db/models/passwordReset'
import { getPasswordValidationMessage } from '@/lib/passwordValidation'

/**
 * DB에 저장된 토큰이 진짜인지 확인하기 위해 동일하게 해싱하는 함수입니다.
 */
function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * 변경될 진짜 새 비밀번호를 암호화하여 DB에 넣기 위한 함수입니다.
 * (로그인/회원가입 시 저장되는 방식과 정확히 동일해야 합니다.)
 */
function hashPassword(password: string) {
  return crypto.pbkdf2Sync(password, 'signup-salt', 1000, 64, 'sha512').toString('hex')
}

/**
 * 사용자가 "비밀번호 변경" 버튼을 눌렀을 때 실행되는 최종 백엔드 API입니다.
 * 링크의 토큰을 검사하여 유효할 때만 비밀번호를 바꿔줍니다.
 */
export async function POST(req: NextRequest) {
  const { email, token, newPassword } = await req.json()

  // 1. 필요한 정보가 다 넘어왔는지 1차 검사
  if (!email || !token || !newPassword) {
    return NextResponse.json({ message: '필수 정보가 누락되었습니다.' }, { status: 400 })
  }

  // 2. 서버 단에서도 한 번 더 비밀번호 규칙 검사 (혹시 프론트엔드를 우회했을 경우를 대비)
  const usernamePart = email.split('@')[0] || ''
  const validationMessage = getPasswordValidationMessage(newPassword, usernamePart)
  if (validationMessage) {
    return NextResponse.json({ message: validationMessage }, { status: 400 })
  }

  try {
    // 3. DB 접속
    await dbConnect()

    // 4. 해당 이메일로 발급된 재설정 요청 티켓(토큰)이 실제로 있는지 확인
    const resetRecord = await PasswordReset.findOne({ email })
    if (!resetRecord) {
      return NextResponse.json({ message: '비밀번호 재설정 요청 내역이 없거나 이미 사용되었습니다.' }, { status: 400 })
    }

    if (new Date() > resetRecord.expiresAt) {
      await PasswordReset.deleteOne({ email }) // 만료되었다면 무효한 데이터이므로 삭제
      return NextResponse.json(
        { message: '비밀번호 재설정 링크의 유효시간(10분)이 지났습니다. 다시 요청해 주세요.' },
        { status: 400 }
      )
    }

    // 6. 사용자가 들고 온 토큰을 해싱해서 DB에 있는 해싱된 토큰과 동일한지 일치 검사
    const hashedInputToken = hashToken(token)
    if (hashedInputToken !== resetRecord.tokenHash) {
      return NextResponse.json({ message: '유효하지 않은 링크이거나 잘못된 접근입니다.' }, { status: 400 })
    }

    // 7. 유저 확인 후 새 비밀번호 저장
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: '가입된 사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    user.passwordHash = hashPassword(newPassword)
    await user.save()

    // 8. 더 이상 재사용하지 못하도록 사용된 토큰(티켓) DB에서 삭제
    await PasswordReset.deleteOne({ email })

    // 완료 응답
    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다.' })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ message: '비밀번호 재설정 처리 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
