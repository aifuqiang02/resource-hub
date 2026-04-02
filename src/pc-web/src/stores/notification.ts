import { defineStore } from 'pinia'
import { ref } from 'vue'
import { httpClient } from '@/services/http/client'
import type { Notification } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchNotifications() {
    isLoading.value = true
    error.value = null
    try {
      const res = await httpClient.get<{ code: number; data: { list: Notification[]; unreadCount: number }; msg: string }>('/notifications')
      notifications.value = res.data.list
      unreadCount.value = res.data.unreadCount
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch notifications'
    } finally {
      isLoading.value = false
    }
  }

  async function markRead(id: string) {
    error.value = null
    const notification = notifications.value.find((n) => n.id === id)
    if (!notification) return
    const wasUnread = !notification.isRead

    try {
      await httpClient.patch(`/notifications/${id}/read`)
      if (wasUnread) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to mark notification as read'
    }
  }

  async function markAllRead() {
    error.value = null
    try {
      await httpClient.patch('/notifications/read')
      notifications.value.forEach((n) => {
        n.isRead = true
      })
      unreadCount.value = 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to mark all as read'
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markRead,
    markAllRead,
  }
})
