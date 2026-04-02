import { httpClient } from '@/services/http/client'

export interface AcquireResourceResponse {
  resourceId: string
  title: string
  shareLink: string
  pointsSpent: number
  currentPointsBalance: number
  alreadyOwned: boolean
}

export interface DownloadHistoryItem {
  id: string
  pointsSpent: number
  downloadedAt: string
  resource: {
    id: string
    title: string
    shareLink: string | null
  }
  version: {
    version: string
  }
}

export interface DownloadHistoryResponse {
  items: DownloadHistoryItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const acquireResource = async (resourceId: string) => {
  const response = await httpClient.post<{ code: number; data: AcquireResourceResponse; msg: string }>(
    `/resources/${resourceId}/acquire`,
  )

  return response.data
}

export const listDownloadHistory = async (page = 1, pageSize = 10) => {
  const response = await httpClient.get<{ code: number; data: DownloadHistoryResponse; msg: string }>(
    '/resources/download-history',
    {
      params: { page, pageSize },
    },
  )

  return response.data
}
