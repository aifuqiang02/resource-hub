import { httpClient } from '@/services/http/client'

export interface DashboardPointTransaction {
  id: string
  type: 'RECHARGE' | 'SPEND' | 'REFUND'
  delta: number
  balanceBefore: number
  balanceAfter: number
  referenceType: string | null
  referenceId: string | null
  createdAt: string
}

export interface DashboardRecentUpload {
  id: string
  title: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE'
  downloadCount: number
  createdAt: string
}

export interface UserDashboardResponse {
  profile: {
    id: string
    name: string
    avatarUrl: string | null
    pointsBalance: number
    joinedAt: string
  }
  stats: {
    totalDownloads: number
    totalUploads: number
  }
  pointTransactions: DashboardPointTransaction[]
  recentUploads: DashboardRecentUpload[]
}

export interface UserPointTransactionsResponse {
  items: DashboardPointTransaction[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const getUserDashboard = async () => {
  const response = await httpClient.get<{ code: number; data: UserDashboardResponse; msg: string }>('/users/me/dashboard')
  return response.data
}

export const listMyPointTransactions = async (page = 1, pageSize = 10) => {
  const response = await httpClient.get<{ code: number; data: UserPointTransactionsResponse; msg: string }>('/users/me/points', {
    params: { page, pageSize },
  })
  return response.data
}
