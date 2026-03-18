import mongoose from 'mongoose'

// 이메일 인증 코드를 임시로 저장하기 위한 데이터베이스 스키마입니다.
// 회원가입 시 사용자가 입력한 이메일의 소유 여부를 확인하기 위해 발급된 코드와 만료시간을 저장합니다.
const EmailVerificationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, unique: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'email_verification',
  }
)

// TTL(Time To Live) 인덱스를 설정하여, expiresAt 시간이 지나면 MongoDB가 자동으로 문서를 삭제하도록 합니다.
// 불필요한 인증 데이터가 DB에 계속 쌓이는 것을 방지합니다.
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// 모델 생성 및 내보내기 (Next.js 환경에서 모델이 여러 번 생성되는 것을 방지)
const EmailVerification =
  mongoose.models.EmailVerification || mongoose.model('EmailVerification', EmailVerificationSchema)

export default EmailVerification
