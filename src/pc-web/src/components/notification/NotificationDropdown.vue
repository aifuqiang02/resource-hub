<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import type { NotificationType } from '@/types/notification'

const notificationStore = useNotificationStore()
const router = useRouter()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

onMounted(() => {
  notificationStore.fetchNotifications()
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value && notificationStore.unreadCount > 0) {
    notificationStore.markAllRead()
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function goToNotifications() {
  isOpen.value = false
  router.push('/user/notifications')
}

function handleNotificationClick(notification: { id: string }) {
  notificationStore.markRead(notification.id)
  goToNotifications()
}

function getNotificationIcon(type: NotificationType) {
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

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative"
      @click="toggleDropdown"
    >
      <span class="material-symbols-outlined">notifications</span>
      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
      ></span>
    </button>

    <Transition
      enter-active-class="transition enter-active:opacity-100"
      enter-from-class="opacity-0"
      leave-active-class="transition leave-active:opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
      >
        <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 class="font-medium text-slate-900 dark:text-white">通知</h3>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div v-if="notificationStore.notifications.length === 0" class="px-4 py-8 text-center text-slate-500">
            <span class="material-symbols-outlined text-4xl">notifications_none</span>
            <p class="mt-2 text-sm">暂无通知</p>
          </div>

          <div v-else>
            <div
              v-for="notification in notificationStore.notifications.slice(0, 5)"
              :key="notification.id"
              class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 last:border-0 cursor-pointer"
@click="handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-3">
                <span
                  class="material-symbols-outlined text-slate-400 mt-0.5"
                >
                  {{ getNotificationIcon(notification.type) }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {{ notification.title }}
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {{ notification.content }}
                  </p>
                  <p class="text-xs text-slate-400 mt-1">
                    {{ formatTime(notification.createdAt) }}
                  </p>
                </div>
                <span
                  v-if="!notification.isRead"
                  class="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5"
                ></span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="notificationStore.notifications.length > 5"
          class="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-center"
        >
          <button
            class="text-sm text-primary hover:text-primary/80 font-medium"
            @click="goToNotifications"
          >
            查看全部
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
