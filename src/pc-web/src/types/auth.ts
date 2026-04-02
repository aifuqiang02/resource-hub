export type UserRole = 'admin' | 'editor' | 'viewer'

export interface UserProfile {
  id: string
  name: string
  email?: string
  avatar?: string
  openId?: string
  unionId?: string
  roles: UserRole[]
  pointsBalance?: number
}

export interface LoginPayload {
  username: string
  password: string
}

export interface WeChatLoginPayload {
  openId: string
  unionId?: string
  nickname: string
  avatarUrl: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  profile: UserProfile
}

export interface RefreshTokenPayload {
  refreshToken: string
}
