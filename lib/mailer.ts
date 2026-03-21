import nodemailer from 'nodemailer'

// 환경 변수가 제대로 설정되어 있는지 확인하고 가져오는 유틸리티 함수입니다.
// SMTP 설정 누락으로 인한 이메일 발송 오류를 사전에 방지하기 위해 쓰입니다.
function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

// Nodemailer를 사용하여 메일 전송 객체(transporter)를 생성하는 함수입니다.
// .env에 설정된 Gmail 계정과 앱 비밀번호를 이용해 연결을 설정합니다.
export function createMailTransport() {
  const user = getRequiredEnv('GMAIL_USER')
  const pass = getRequiredEnv('GMAIL_PASS')

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  })
}

// 발신자 이메일 주소를 가져오는 함수입니다.
export function getMailFromAddress() {
  return getRequiredEnv('GMAIL_USER')
}

// 회원가입 시 인증 메일을 실제로 전송하는 함수입니다.
export async function sendVerificationEmail(params: { email: string; code: string }) {
  const transporter = createMailTransport()
  const from = getMailFromAddress()

  // 수신자 메일로 제목, 텍스트 형태, 그리고 HTML 디자인이 포함된 이메일을 발송합니다.
  await transporter.sendMail({
    from,
    to: params.email,
    subject: '[CONNECT] 이메일 인증 코드 안내',
    text: `CONNECT 이메일 인증 코드입니다.\n\n인증 코드: ${params.code}\n\n5분 안에 입력해 주세요.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin-bottom: 16px;">CONNECT 이메일 인증</h2>
        <p>아래 인증 코드를 회원가입 화면에 입력해 주세요.</p>
        <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 12px; font-size: 28px; font-weight: 700; letter-spacing: 6px; text-align: center;">
          ${params.code}
        </div>
        <p>인증 코드는 5분 동안만 유효합니다.</p>
      </div>
    `,
  })
}
