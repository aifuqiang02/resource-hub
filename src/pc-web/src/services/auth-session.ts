import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import type { LoginResponse, UserProfile } from '@/types/auth'
import { readStorage, writeStorage } from '@/utils/storage'

export const getStoredAccessToken = () => localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) || ''

export const getStoredRefreshToken = () => localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) || ''

export const getStoredProfile = () => readStorage<UserProfile | null>(AUTH_STORAGE_KEYS.profile, null)

export const getStoredUserId = () => getStoredProfile()?.id || ''

export const persistSession = (payload: LoginResponse) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, payload.accessToken)
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, payload.refreshToken)
  writeStorage(AUTH_STORAGE_KEYS.profile, payload.profile)
}

export const clearStoredSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken)
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken)
  localStorage.removeItem(AUTH_STORAGE_KEYS.profile)
}
