import { ref } from 'vue'

export const useAsyncState = <T>() => {
  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  const execute = async (runner: () => Promise<T>) => {
    loading.value = true
    error.value = null

    try {
      data.value = await runner()
      return data.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unexpected error'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    execute,
  }
}
