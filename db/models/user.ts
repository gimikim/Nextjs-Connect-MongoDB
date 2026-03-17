import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    nickname: { type: String, default: '', trim: true },
    profile_image_url: { type: String, default: '' },
    user_type: { type: String, default: '' },
    birthDate: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phoneNumber: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    marketingConsent: { type: Boolean, default: false },
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

UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ username: 1 }, { unique: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
