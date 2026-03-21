import mongoose from 'mongoose'

// 사용자(User) 정보를 MongoDB 데이터베이스에 저장하기 위한 모델 스키마입니다.
// 회원가입 시 입력받은 정보(일반/사업자, 생년월일, 주소 등)의 구조를 정의하고 제약조건을 설정합니다.
const UserSchema = new mongoose.Schema(
  {
    // 사용자의 실명 (예: 홍길동). 필수 입력 항목이며 앞뒤 공백을 제거(trim)하여 저장합니다.
    name: { type: String, required: true, trim: true },

    // 로그인 및 알림에 사용되는 이메일 주소. 고유해야 하며(unique) 다른 사람과 중복될 수 없습니다.
    email: { type: String, required: true, trim: true, unique: true },

    // 커뮤니티나 서비스 내에서 보여질 별명. 필수 항목은 아니며 미입력 시 빈 칸이 기본값입니다.
    nickname: { type: String, default: '', trim: true },

    // 사용자의 프로필 사진 이미지 주소 (URL). 파일이나 이미지 링크를 문자로 저장합니다.
    profile_image_url: { type: String, default: '' },

    // 사용자의 권한 등급/분류. '일반 회원(personal)'과 '사업자 회원(business)' 중 하나만 가질 수 있습니다.
    user_type: { type: String, enum: ['personal', 'business'], default: 'personal' },

    // 사용자의 생년월일 (예: 1990-01-01). 나이나 생일 이벤트를 위해 필수로 저장합니다.
    birthDate: { type: String, required: true },

    // 사용자의 성별. '남성(male)', '여성(female)', '기타(other)' 셋 중 하나만 입력 가능합니다.
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },

    // 연락처 (휴대폰 번호). 010-1234-5678 형식 등의 문자로 저장되며 필수입니다.
    phoneNumber: { type: String, required: true, trim: true },

    // 로그인에 사용할 전용 아이디(ID). 다른 사람의 아이디와 중복될 수 없도록 unique 설정이 되어 있습니다.
    username: { type: String, required: true, trim: true, unique: true },

    // 관리자도 원래 비밀번호를 알아볼 수 없게 해싱(암호화) 처리된 비밀번호 문자열이 저장됩니다.
    passwordHash: { type: String, required: true },

    // 배송이나 우편물 수령 등에 사용할 기본 주소 정보입니다.
    address: { type: String, required: true, trim: true },

    // 가입 단계에서 선택한 계정의 기본 유형 (개인용 vs 비즈니스용)입니다.
    accountType: { type: String, enum: ['personal', 'business'], default: 'personal' },

    // (사업자 회원의 경우) 회사(법인/상호)명입니다. 일반 회원이면 그냥 빈 칸으로 남습니다.
    companyName: { type: String, default: '', trim: true },

    // (사업자 회원의 경우) 10자리 사업자등록번호입니다. 기호를 포함할 수 있어 문자열로 저장합니다.
    businessNumber: { type: String, default: '', trim: true },

    // 이메일 인증 코드를 통해 이메일 소유자임이 확인되었는지(true/false) 여부를 나타냅니다.
    emailVerified: { type: Boolean, default: false },

    // 이메일 인증이 완전히 성공하여 통과된 시점의 구체적인 날짜와 시간을 기록합니다.
    emailVerifiedAt: { type: Date, default: null },

    // 이 계정이 시스템에 맨 처음 만들어진 생성 날짜와 시간입니다. 가입 시 자동 기록됩니다.
    createdAt: { type: Date, default: Date.now },

    // 회원 정보(비번, 통화, 주소 등)가 마지막으로 수정(업데이트)된 날짜와 시간입니다.
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
