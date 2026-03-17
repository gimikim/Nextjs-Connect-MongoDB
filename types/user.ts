export interface User {
  name: string
  email: string
  nickname?: string
  profile_image_url?: string
  user_type?: string
  birthDate: string
  gender: 'male' | 'female' | 'other'
  phoneNumber: string
  username: string
  passwordHash: string
  address: string
  marketingConsent: boolean
  accountType: 'personal' | 'business'
  companyName: string
  businessNumber: string
  emailVerified: boolean
  emailVerifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
