export type NotificationType = 'AUDIT_RESULT' | 'ACCOUNT_BANNED' | 'ACCOUNT_WARNED'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  metadata: Record<string, unknown>
  isRead: boolean
  createdAt: string
  readAt?: string
}

export interface NotificationListResponse {
  list: Notification[]
  unreadCount: number
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
