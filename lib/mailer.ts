import nodemailer from 'nodemailer'

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function createMailTransport() {
  const host = getRequiredEnv('SMTP_HOST')
  const port = Number(getRequiredEnv('SMTP_PORT'))
  const user = getRequiredEnv('SMTP_USER')
  const pass = getRequiredEnv('SMTP_PASS')

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export function getMailFromAddress() {
  return process.env.MAIL_FROM ?? getRequiredEnv('SMTP_USER')
}

export async function sendVerificationEmail(params: { email: string; code: string }) {
  const transporter = createMailTransport()
  const from = getMailFromAddress()

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
