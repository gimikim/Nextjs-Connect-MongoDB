import mongoose from 'mongoose'

// 사용자(User) 정보를 MongoDB 데이터베이스에 저장하기 위한 모델 스키마입니다.
// 회원가입 시 입력받은 정보(일반/사업자, 생년월일, 주소 등)의 구조를 정의하고 제약조건을 설정합니다.
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    nickname: { type: String, default: '', trim: true },
    profile_image_url: { type: String, default: '' },
    user_type: { type: String, enum: ['personal', 'business'], default: 'personal' },
    birthDate: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phoneNumber: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    accountType: { type: String, enum: ['personal', 'business'], default: 'personal' },
    companyName: { type: String, default: '', trim: true },
    businessNumber: { type: String, default: '', trim: true },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'user',
  }
)

// 검색 성능 향상 및 중복 방지를 위해 이메일과 아이디에 고유(unique) 인덱스를 생성합니다.
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ username: 1 }, { unique: true })

// 이미 생성된 모델이 있으면 재사용하고, 없으면 새로 생성하여 내보냅니다.
const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
