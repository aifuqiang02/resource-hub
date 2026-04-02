import MockAdapter from 'axios-mock-adapter'
import { afterEach, describe, expect, it } from 'vitest'
import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import { createHttpClient } from './create-http-client'

describe('createHttpClient', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('retries request after refresh token succeeds', async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, 'expired-token')
    localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, 'mock-admin-refresh-token')
    localStorage.setItem(
      AUTH_STORAGE_KEYS.profile,
      JSON.stringify({
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        roles: ['admin'],
      }),
    )

    const client = createHttpClient()
    const apiMock = new MockAdapter(client)
    let attempts = 0

    apiMock.onGet('/secure').reply(() => {
      attempts += 1

      if (attempts === 1) {
        return [401, { message: 'expired' }]
      }

      return [200, { ok: true }]
    })

    const response = await client.get('/secure')

    expect(response.data).toEqual({ ok: true })
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)).toBe('mock-admin-token-refreshed')
    apiMock.restore()
  })
})
