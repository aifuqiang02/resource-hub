import axios from 'axios'
import { appEnv } from '@/config/env'
import type { LoginPayload, LoginResponse, RefreshTokenPayload } from '@/types/auth'
import { mockRefreshTokens, mockUsers } from './auth-mock'

const shouldUseMockAuth = appEnv.enableMock || import.meta.env.MODE === 'test'
const authApi = axios.create({
  baseURL: appEnv.apiBaseUrl,
  timeout: appEnv.requestTimeout,
  headers: {
    Accept: 'application/json',
  },
})

export interface WeChatLoginPayload {
  openId: string
  unionId?: string
  nickname?: string
  avatarUrl?: string
}

export const weChatLogin = async (payload: WeChatLoginPayload): Promise<LoginResponse> => {
  if (shouldUseMockAuth) {
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    return mockUsers['admin'] as LoginResponse
  }

  const response = await authApi.post<{ code: number; data: LoginResponse; msg: string }>('/auth/wechat-login', payload)
  return response.data.data
}

export const login = async (payload: LoginPayload) => {
  if (shouldUseMockAuth) {
    await new Promise((resolve) => window.setTimeout(resolve, 300))

    const user = mockUsers[payload.username]

    if (!user || payload.password.length < 6) {
      throw new Error('用户名或密码错误，Mock 环境可使用 admin/editor + 任意 6 位以上密码登录')
    }

    return user
  }

  const response = await authApi.post<{ code: number; data: LoginResponse; msg: string }>('/auth/login', payload)

  return response.data.data
}

export const refreshAccessToken = async (payload: RefreshTokenPayload) => {
  if (shouldUseMockAuth) {
    await new Promise((resolve) => window.setTimeout(resolve, 150))

    const session = mockRefreshTokens[payload.refreshToken]

    if (!session) {
      throw new Error('刷新登录态失败，请重新登录')
    }

    return session
  }

  const response = await authApi.post<{ code: number; data: LoginResponse; msg: string }>('/auth/refresh', payload, {
    headers: {
      Authorization: undefined,
    },
  })

  return response.data.data
}
