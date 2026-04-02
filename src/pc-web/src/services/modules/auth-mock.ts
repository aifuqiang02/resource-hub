import type { LoginResponse } from '@/types/auth'

const adminSession: LoginResponse = {
  accessToken: 'mock-admin-token',
  refreshToken: 'mock-admin-refresh-token',
  profile: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    roles: ['admin'],
  },
}

const editorSession: LoginResponse = {
  accessToken: 'mock-editor-token',
  refreshToken: 'mock-editor-refresh-token',
  profile: {
    id: '2',
    name: 'Editor User',
    email: 'editor@example.com',
    roles: ['editor'],
  },
}

export const mockUsers: Record<string, LoginResponse> = {
  admin: adminSession,
  editor: editorSession,
}

export const mockRefreshTokens: Record<string, LoginResponse> = {
  'mock-admin-refresh-token': {
    accessToken: 'mock-admin-token-refreshed',
    refreshToken: adminSession.refreshToken,
    profile: adminSession.profile,
  },
  'mock-editor-refresh-token': {
    accessToken: 'mock-editor-token-refreshed',
    refreshToken: editorSession.refreshToken,
    profile: editorSession.profile,
  },
}
