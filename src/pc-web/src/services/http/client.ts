import type { AxiosRequestConfig } from 'axios'
import { createHttpClient } from './create-http-client'

const client = createHttpClient()

export const httpClient = {
  async request<T>(config: AxiosRequestConfig) {
    const response = await client.request<T>(config)

    return response.data
  },

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'GET', url })
  },

  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'POST', url, data })
  },

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  },

  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  },

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>({ ...config, method: 'DELETE', url })
  },
}
