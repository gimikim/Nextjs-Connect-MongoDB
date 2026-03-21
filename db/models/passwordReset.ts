import mongoose from 'mongoose'

// 사용자가 비밀번호 재설정을 요청했을 때 발급하는 1회성 토큰을 저장하는 DB 스키마입니다.
const PasswordResetSchema = new mongoose.Schema(
  {
    // 어느 이메일에 대해 발급된 토큰인지 저장합니다.
    email: { type: String, required: true, trim: true },
    // 보안을 위해 실제 발급된 긴 문자열 토큰을 암호화(해싱)하여 저장합니다.
    tokenHash: { type: String, required: true },
    // 토큰이 언제 만료되는지 저장합니다. (예: 10분 후)
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true, // 생성된 시간(createdAt), 수정된 시간(updatedAt)을 자동 기록
    collection: 'password_reset', // DB에 저장될 실제 컬렉션(테이블) 이름 지정
  }
)

// TTL(Time To Live) 인덱스를 설정하여, expiresAt 시간이 지나면 MongoDB가 해당 데이터를 스스로 자동 삭제하도록 만듭니다.
// 이를 통해 불필요한 기간 만료 데이터가 DB를 가득 채우는 것을 방지합니다.
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Next.js 개발 환경에서 파일이 재실행될 때 모델이 중복 생성되는 에러를 막기 위한 코드입니다.
const PasswordReset = mongoose.models.PasswordReset || mongoose.model('PasswordReset', PasswordResetSchema)

export default PasswordReset
