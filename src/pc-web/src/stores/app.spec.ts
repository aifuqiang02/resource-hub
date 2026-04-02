import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './app'

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('persists theme changes', () => {
    const store = useAppStore()

    store.setTheme('dark')

    expect(store.isDark).toBe(true)
    expect(localStorage.getItem('vite-vue3-template.theme')).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
