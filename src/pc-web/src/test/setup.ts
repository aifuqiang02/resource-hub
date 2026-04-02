import { afterEach } from 'vitest'

afterEach(() => {
  localStorage.clear()
  document.documentElement.dataset.theme = 'light'
})
