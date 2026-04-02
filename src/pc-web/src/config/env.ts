const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : fallback
}

const toBoolean = (value: string | undefined) => value === 'true'
const requireString = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing required env: ${key}`)
  }

  return value
}

export const appEnv = {
  appTitle: requireString(import.meta.env.VITE_APP_TITLE, 'VITE_APP_TITLE'),
  apiBaseUrl: requireString(import.meta.env.VITE_API_BASE_URL, 'VITE_API_BASE_URL'),
  requestTimeout: toNumber(requireString(import.meta.env.VITE_REQUEST_TIMEOUT, 'VITE_REQUEST_TIMEOUT'), 10_000),
  enableMock: toBoolean(import.meta.env.VITE_ENABLE_MOCK),
  openPlatformBaseUrl: requireString(import.meta.env.VITE_OPEN_PLATFORM_BASE_URL, 'VITE_OPEN_PLATFORM_BASE_URL').replace(/\/$/, ''),
  openPlatformAppId: requireString(import.meta.env.VITE_OPEN_PLATFORM_APP_ID, 'VITE_OPEN_PLATFORM_APP_ID'),
  qrCodeServiceBaseUrl: requireString(import.meta.env.VITE_QR_CODE_SERVICE_BASE_URL, 'VITE_QR_CODE_SERVICE_BASE_URL').replace(/\/$/, ''),
}
