export const readStorage = <T>(key: string, fallback: T): T => {
  const value = localStorage.getItem(key)

  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const writeStorage = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value))
}
