import { httpClient } from '@/services/http'

export interface HealthCheckResponse {
  status: string
  timestamp: string
}

export const getHealthCheck = () => httpClient.get<HealthCheckResponse>('health')
