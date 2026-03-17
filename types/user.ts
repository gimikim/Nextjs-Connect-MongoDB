export interface User {
  name: string
  email: string
  nickname?: string
  profile_image_url?: string
  user_type?: string
  birthDate: string
  gender: 'male' | 'female' | 'other'
  phoneNumber: string
  address: string
  username: string
  passwordHash: string
  accountType: 'personal' | 'business'
  companyName: string
  businessNumber: string
  emailVerified: boolean
  emailVerifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
