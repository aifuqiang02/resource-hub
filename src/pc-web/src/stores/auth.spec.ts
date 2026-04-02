import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import { useAuthStore } from './auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('stores session after sign in', async () => {
    const store = useAuthStore()

    await store.signIn({
      username: 'admin',
      password: '123456',
    })

    expect(store.isAuthenticated).toBe(true)
    expect(store.roles).toContain('admin')
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBeTruthy()
  })
})
