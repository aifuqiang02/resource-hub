import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { appEnv } from '@/config/env'
import { clearStoredSession, getStoredAccessToken, getStoredRefreshToken, getStoredUserId, persistSession } from '@/services/auth-session'
import { refreshAccessToken } from '@/services/modules/auth'

export class HttpError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.details = details
  }
}

const toHttpError = (error: AxiosError<{ message?: string }>) => {
  if (error.code === 'ECONNABORTED') {
    return new HttpError('Request timeout', 408, error.response?.data)
  }

  const status = error.response?.status ?? 500
  const message = error.response?.data?.message || error.message || 'Unexpected request error'

  return new HttpError(message, status, error.response?.data)
}

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const createHttpClient = (config?: AxiosRequestConfig): AxiosInstance => {
  const client = axios.create({
    baseURL: appEnv.apiBaseUrl,
    timeout: appEnv.requestTimeout,
    headers: {
      Accept: 'application/json',
    },
    ...config,
  })

  client.interceptors.request.use((request) => {
    const token = getStoredAccessToken()
    const userId = getStoredUserId()

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    if (userId) {
      request.headers.set('x-user-key', userId)
    }

    return request
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string }>) => {
      const request = error.config as RetryableAxiosRequestConfig | undefined

      if (error.response?.status === 401 && request && !request._retry) {
        const refreshToken = getStoredRefreshToken()

        if (!refreshToken) {
          clearStoredSession()
          return Promise.reject(toHttpError(error))
        }

        request._retry = true

        try {
          const nextSession = await refreshAccessToken({ refreshToken })
          persistSession(nextSession)

          request.headers.set('Authorization', `Bearer ${nextSession.accessToken}`)

          return client(request)
        } catch {
          clearStoredSession()
        }
      }

      return Promise.reject(toHttpError(error))
    },
  )

  return client
}
