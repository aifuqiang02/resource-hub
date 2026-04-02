import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants/app'

type ThemeMode = 'light' | 'dark'

const getInitialTheme = (): ThemeMode => {
  const cached = localStorage.getItem(STORAGE_KEYS.theme)

  return cached === 'dark' ? 'dark' : 'light'
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>(getInitialTheme())
  const initialized = ref(false)
  const isLoading = ref(false)

  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (value: ThemeMode) => {
    theme.value = value
    localStorage.setItem(STORAGE_KEYS.theme, value)
    document.documentElement.dataset.theme = value
  }

  const initialize = () => {
    setTheme(theme.value)
    initialized.value = true
  }

  return {
    theme,
    initialized,
    isLoading,
    isDark,
    initialize,
    setTheme,
  }
})
