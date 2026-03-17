import mongoose from 'mongoose'

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

EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const EmailVerification =
  mongoose.models.EmailVerification || mongoose.model('EmailVerification', EmailVerificationSchema)

export default EmailVerification
