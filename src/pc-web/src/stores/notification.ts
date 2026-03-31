import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Notification } from '@/types/notification'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)

  async function fetchNotifications() {
    isLoading.value = true
    try {
      const res = await axios.get(`${BASE_URL}/notifications`)
      notifications.value = res.data.data.list
      unreadCount.value = res.data.data.unreadCount
    } finally {
      isLoading.value = false
    }
  }

  async function markRead(id: string) {
    await axios.patch(`${BASE_URL}/notifications/${id}/read`)
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllRead() {
    await axios.patch(`${BASE_URL}/notifications/read`)
    notifications.value.forEach((n) => {
      n.isRead = true
    })
    unreadCount.value = 0
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markRead,
    markAllRead,
  }
})
