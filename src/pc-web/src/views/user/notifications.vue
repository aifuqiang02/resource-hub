<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import type { NotificationType } from '@/types/notification'

defineOptions({
  name: 'NotificationsPage',
})

const notificationStore = useNotificationStore()
const activeFilter = ref<NotificationType | 'ALL'>('ALL')

onMounted(() => {
  notificationStore.fetchNotifications()
})

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'ALL') {
    return notificationStore.notifications
  }
  return notificationStore.notifications.filter((n) => n.type === activeFilter.value)
})

const filters = [
  { label: '全部', value: 'ALL' as const },
  { label: '审核结果', value: 'AUDIT_RESULT' as NotificationType },
  { label: '账号禁用', value: 'ACCOUNT_BANNED' as NotificationType },
  { label: '账号警告', value: 'ACCOUNT_WARNED' as NotificationType },
]

function getNotificationIcon(type: string) {
  switch (type) {
    case 'AUDIT_RESULT':
      return 'task_alt'
    case 'ACCOUNT_BANNED':
      return 'block'
    case 'ACCOUNT_WARNED':
      return 'warning'
    default:
      return 'notifications'
  }
}

function getNotificationTypeName(type: string) {
  switch (type) {
    case 'AUDIT_RESULT':
      return '审核结果'
    case 'ACCOUNT_BANNED':
      return '账号禁用'
    case 'ACCOUNT_WARNED':
      return '账号警告'
    default:
      return '通知'
  }
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">通知中心</h1>
      <span class="text-sm text-slate-500">
        共 {{ notificationStore.notifications.length }} 条通知，
        {{ notificationStore.unreadCount }} 条未读
      </span>
    </div>

    <div class="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
      <button
        v-for="filter in filters"
        :key="filter.value"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="
          activeFilter === filter.value
            ? 'bg-primary text-white'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        "
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <div v-if="notificationStore.isLoading" class="text-center py-12">
      <span class="material-symbols-outlined text-4xl animate-spin text-slate-400">progress_activity</span>
      <p class="mt-2 text-slate-500">加载中...</p>
    </div>

    <div v-else-if="filteredNotifications.length === 0" class="text-center py-12">
      <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">notifications_none</span>
      <p class="mt-4 text-slate-500">暂无通知</p>
    </div>

    <div v-if="notificationStore.error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
      {{ notificationStore.error }}
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
        :class="{ 'border-l-4 border-l-primary': !notification.isRead }"
        @click="notificationStore.markRead(notification.id)"
      >
        <div class="flex items-start gap-4">
          <span
            class="material-symbols-outlined text-2xl mt-0.5"
            :class="
              notification.type === 'AUDIT_RESULT'
                ? 'text-green-500'
                : notification.type === 'ACCOUNT_BANNED'
                  ? 'text-red-500'
                  : 'text-orange-500'
            "
          >
            {{ getNotificationIcon(notification.type) }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {{ getNotificationTypeName(notification.type) }}
              </span>
              <span v-if="!notification.isRead" class="text-xs text-primary">未读</span>
            </div>
            <h3 class="font-medium text-slate-900 dark:text-white">
              {{ notification.title }}
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {{ notification.content }}
            </p>
            <p class="text-xs text-slate-400 mt-2">
              {{ formatTime(notification.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
