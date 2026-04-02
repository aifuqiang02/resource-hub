const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

const toBoolean = (value: string | undefined) => value === 'true'

export const appEnv = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'Vue 3 App Base',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  requestTimeout: toNumber(import.meta.env.VITE_REQUEST_TIMEOUT, 10_000),
  enableMock: toBoolean(import.meta.env.VITE_ENABLE_MOCK),
}
