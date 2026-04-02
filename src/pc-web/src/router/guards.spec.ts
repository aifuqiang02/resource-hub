import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { setupRouterGuards } from './guards'
import { routes } from './routes'

describe('router guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('redirects guests to login for protected routes', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    setupRouterGuards(router)
    await router.push('/dashboard')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('blocks users without required role', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
    const authStore = useAuthStore()

    authStore.setSession({
      accessToken: 'token',
      refreshToken: 'refresh',
      profile: {
        id: '2',
        name: 'Editor User',
        email: 'editor@example.com',
        roles: ['editor'],
      },
    })

    setupRouterGuards(router)
    await router.push('/admin')

    expect(router.currentRoute.value.name).toBe('forbidden')
  })
})
