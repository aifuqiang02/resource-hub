import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login } from '@/services/modules/auth'
import type { LoginPayload, LoginResponse, UserProfile, UserRole } from '@/types/auth'
import {
  clearStoredSession,
  getStoredAccessToken,
  getStoredProfile,
  getStoredRefreshToken,
  persistSession,
} from '@/services/auth-session'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(getStoredAccessToken())
  const refreshToken = ref(getStoredRefreshToken())
  const profile = ref<UserProfile | null>(getStoredProfile())
  const redirectAfterLogin = ref('/dashboard')
  const loading = ref(false)

  const isAuthenticated = computed(() => Boolean(accessToken.value && profile.value))
  const roles = computed(() => profile.value?.roles ?? [])

  const hasAnyRole = (allowedRoles?: UserRole[]) => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true
    }

    return allowedRoles.some((role) => roles.value.includes(role))
  }

  const setSession = (payload: LoginResponse) => {
    accessToken.value = payload.accessToken
    refreshToken.value = payload.refreshToken
    profile.value = payload.profile

    persistSession(payload)
  }

  const clearSession = () => {
    accessToken.value = ''
    refreshToken.value = ''
    profile.value = null

    clearStoredSession()
  }

  const patchProfile = (patch: Partial<UserProfile>) => {
    if (!profile.value) {
      return
    }

    profile.value = {
      ...profile.value,
      ...patch,
    }

    persistSession({
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      profile: profile.value,
    })
  }

  const signIn = async (payload: LoginPayload) => {
    loading.value = true

    try {
      const response = await login(payload)
      setSession(response)
      return response
    } finally {
      loading.value = false
    }
  }

  const signOut = () => {
    clearSession()
  }

  return {
    accessToken,
    refreshToken,
    profile,
    redirectAfterLogin,
    loading,
    roles,
    isAuthenticated,
    hasAnyRole,
    signIn,
    signOut,
    setSession,
    patchProfile,
    clearSession,
  }
})
