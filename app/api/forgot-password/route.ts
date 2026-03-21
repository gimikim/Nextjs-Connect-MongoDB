import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'
import { sendPasswordResetEmail } from '@/lib/mailer'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 비밀번호를 안전하게 저장하기 위해 암호화(해싱)하는 함수입니다.
 * 회원가입(signup) 시 사용된 것과 반드시 동일한 암호화 방식(알고리즘, 솔트(salt), 반복 횟수)을 사용해야,
 * 나중에 로그인할 때 정상적으로 비밀번호가 일치하는지 확인할 수 있습니다.
 */
function hashPassword(password: string) {
  return crypto.pbkdf2Sync(password, 'signup-salt', 1000, 64, 'sha512').toString('hex')
}

/**
 * 보안 규칙에 맞춰 영문 대소문자, 숫자, 특수문자가 섞인 무작위 임시 비밀번호 10자리를 생성하는 함수입니다.
 * Node.js의 crypto.randomInt를 사용하여 보안적으로 더 안전한 난수를 생성합니다.
 */
function generateTemporaryPassword(length = 10) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*' // 기본 특수문자들
  const all = upper + lower + numbers + special

  let password = ''

  // 1. 각 카테고리(대문자, 소문자, 숫자, 특수문자)별로 무조건 1개 이상씩 뽑아서 패스워드 문자열에 추가합니다.
  password += upper[crypto.randomInt(upper.length)]
  password += lower[crypto.randomInt(lower.length)]
  password += numbers[crypto.randomInt(numbers.length)]
  password += special[crypto.randomInt(special.length)]

  // 2. 남은 길이(6자리)만큼 전체 문자 세트에서 무작위로 추출하여 덧붙입니다.
  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(all.length)]
  }

  // 3. 앞서 무조건 1개씩 뽑았던 카테고리 순서가 유추되지 않도록 배열을 무작위로 섞습니다(Fisher-Yates shuffle 알고리즘).
  const arr = password.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    // 위치 맞바꾸기
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  // 4. 다시 문자열로 합쳐서 반환합니다.
  return arr.join('')
}

/**
 * 사용자가 "코드 전송"을 클릭했을 때 이메일을 받아 임시 비밀번호를 발급해주는 백엔드 API 엔드포인트입니다.
 */
export async function POST(req: NextRequest) {
  const { email } = await req.json()

  // 1. 넘어온 이메일 값 자체가 없거나 형식이 잘못되었는지 검사합니다.
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: '올바른 이메일 형식을 입력해 주세요.' }, { status: 400 })
  }

  try {
    // 2. 데이터베이스에 연결
    await dbConnect()

    // 3. 해당 이메일을 가지고 가입한 사용자가 실제로 데이터베이스에 있는지 확인합니다.
    const user = await User.findOne({ email })

    // 만약 사용자가 없다면 보안(해킹 방지)을 위해
    // "이메일이 없습니다" 라는 말을 그대로 알려주지 않고 "가입되지 않은 이메일입니다"라고 안내합니다.
    if (!user) {
      return NextResponse.json({ message: '해당 이메일로 가입된 계정을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 4. 임시 비밀번호 생성 (대소문자, 숫자, 특수문자가 섞인 10자리)
    const tempPassword = generateTemporaryPassword(10)

    // 생성된 임시 패스워드를 암호화(해싱)
    const hashedTempPassword = hashPassword(tempPassword)

    // 5. 사용자의 DB 정보에 해싱된 새 비밀번호로 덮어쓰기(업데이트) 합니다.
    user.passwordHash = hashedTempPassword
    await user.save()

    // 6. 메일 전송 도구를 이용해 '암호화 되기 전 실제 임시 비밀번호 문자'를 이메일로 전송합니다.
    await sendPasswordResetEmail({ email, tempPassword })

    // 정상적으로 전송되었다고 프론트쪽에 성공 응답 메시지를 돌려줍니다.
    return NextResponse.json({ message: '재설정 안내를 전송했습니다.' })
  } catch (error) {
    console.error('Failed to reset password:', error)
    return NextResponse.json({ message: '임시 비밀번호 발급 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
