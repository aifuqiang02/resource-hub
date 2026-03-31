# 通知功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 resource-hub 添加通知功能，支持资源审核结果、账号禁用、账号警告三类系统通知

**Architecture:** 后端新增 notification 模块（路由/控制器/服务），前端新增 notification store 和下拉组件，在用户布局中集成

**Tech Stack:** Express + Prisma + PostgreSQL (后端)，Vue 3 + Pinia + TypeScript (前端)

---

## 文件结构

```
src/api/
├── prisma/schema.prisma                    # 添加 Notification 模型
├── src/modules/
│   └── notifications/                      # 新建
│       ├── notifications.route.ts
│       ├── notifications.controller.ts
│       ├── notifications.service.ts
│       └── notifications.schema.ts
├── src/routes/index.ts                     # 注册 notificationsRouter

src/pc-web/
├── src/types/notification.ts               # 新建
├── src/stores/notification.ts              # 新建
├── src/components/notification/           # 新建
│   └── NotificationDropdown.vue
├── src/views/user/
│   ├── user-layout.vue                     # 集成通知组件
│   └── notifications.vue                   # 新建通知列表页
└── src/router/routes.ts                    # 添加 /notifications 路由
```

---

## Task 1: 后端 - Prisma Schema

**Files:**
- Modify: `src/api/prisma/schema.prisma`

- [ ] **Step 1: 添加 NotificationType 枚举和 Notification 模型**

```prisma
enum NotificationType {
  AUDIT_RESULT
  ACCOUNT_BANNED
  ACCOUNT_WARNED
}

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  type      NotificationType
  title     String
  content   String
  metadata  Json             @default("{}")
  isRead    Boolean          @default(false)
  createdAt DateTime        @default(now()) @map("created_at")
  readAt    DateTime?       @map("read_at")

  @@index([userId, createdAt])
  @@index([userId, isRead])
  @@map("notifications")
}
```

- [ ] **Step 2: 执行数据库迁移**

```bash
cd src/api && pnpm prisma migrate dev --name add_notifications
```

- [ ] **Step 3: 提交**

```bash
git add src/api/prisma/schema.prisma src/api/prisma/migrations
git commit -m "feat(api): add Notification model and NotificationType enum"
```

---

## Task 2: 后端 - Notification 模块

**Files:**
- Create: `src/api/src/modules/notifications/notifications.route.ts`
- Create: `src/api/src/modules/notifications/notifications.controller.ts`
- Create: `src/api/src/modules/notifications/notifications.service.ts`
- Create: `src/api/src/modules/notifications/notifications.schema.ts`
- Modify: `src/api/src/routes/index.ts`

### 2.1 notifications.schema.ts

- [ ] **Step 1: 编写 Zod schema**

```typescript
import { z } from 'zod'

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
})

export const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
})

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>
export type NotificationIdParam = z.infer<typeof notificationIdParamSchema>
```

### 2.2 notifications.service.ts

- [ ] **Step 2: 编写 service**

```typescript
import { prisma } from '../../lib/prisma'
import { NotificationType } from '../../generated/prisma/index'

export type { NotificationType }

export async function listNotifications(userId: string, page: number, pageSize: number) {
  const skip = (page - 1) * pageSize

  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ])

  return {
    list: items,
    unreadCount,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  })

  if (!notification) {
    return null
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  })
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  })
}

export async function createNotification(data: {
  userId: string
  type: NotificationType
  title: string
  content: string
  metadata?: Record<string, any>
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      metadata: data.metadata ?? {},
    },
  })
}
```

### 2.3 notifications.controller.ts

- [ ] **Step 3: 编写 controller**

```typescript
import type { Request, Response } from 'express'
import { sendSuccess } from '../../lib/http-response'
import { AppError } from '../../lib/app-error'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notifications.service'
import { listNotificationsSchema, notificationIdParamSchema } from './notifications.schema'

export async function getNotifications(req: Request, res: Response) {
  const userId = req.user!.id
  const { page, pageSize } = listNotificationsSchema.parse(req.query)

  const result = await listNotifications(userId, page, pageSize)
  return sendSuccess(res, result)
}

export async function markRead(req: Request, res: Response) {
  const userId = req.user!.id
  const { id } = notificationIdParamSchema.parse(req.params)

  const notification = await markNotificationRead(userId, id)
  if (!notification) {
    throw new AppError('Notification not found', 404)
  }

  return sendSuccess(res, { message: 'success' })
}

export async function markAllRead(req: Request, res: Response) {
  const userId = req.user!.id
  await markAllNotificationsRead(userId)
  return sendSuccess(res, { message: 'success' })
}
```

### 2.4 notifications.route.ts

- [ ] **Step 4: 编写路由**

```typescript
import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth'
import { validate } from '../../middlewares/validate'
import { getNotifications, markRead, markAllRead } from './notifications.controller'
import { listNotificationsSchema, notificationIdParamSchema } from './notifications.schema'

export const notificationsRouter = Router()

notificationsRouter.get('/', requireAuth(), validate(listNotificationsSchema), getNotifications)
notificationsRouter.patch('/read', requireAuth(), markAllRead)
notificationsRouter.patch('/:id/read', requireAuth(), validate(notificationIdParamSchema), markRead)
```

### 2.5 注册路由

- [ ] **Step 5: 在 routes/index.ts 添加 notifications 路由**

```typescript
import { notificationsRouter } from '../modules/notifications/notifications.route'

apiRouter.use('/notifications', notificationsRouter)
```

- [ ] **Step 6: 提交**

```bash
git add src/api/src/modules/notifications/
git add src/api/src/routes/index.ts
git commit -m "feat(api:notifications): add notifications module"
```

---

## Task 3: 前端 - 类型定义和 Store

**Files:**
- Create: `src/pc-web/src/types/notification.ts`
- Create: `src/pc-web/src/stores/notification.ts`

### 3.1 类型定义

- [ ] **Step 1: 创建类型定义**

```typescript
export type NotificationType = 'AUDIT_RESULT' | 'ACCOUNT_BANNED' | 'ACCOUNT_WARNED'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  metadata: Record<string, any>
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
```

### 3.2 Store

- [ ] **Step 2: 创建 notification store**

```typescript
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
```

- [ ] **Step 3: 提交**

```bash
git add src/pc-web/src/types/notification.ts
git add src/pc-web/src/stores/notification.ts
git commit -m "feat(pc-web): add notification types and store"
```

---

## Task 4: 前端 - NotificationDropdown 组件

**Files:**
- Create: `src/pc-web/src/components/notification/NotificationDropdown.vue`

- [ ] **Step 1: 创建 NotificationDropdown.vue**

```vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'

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
  router.push('/notifications')
}

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
              @click="goToNotifications"
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
```

- [ ] **Step 2: 提交**

```bash
git add src/pc-web/src/components/notification/NotificationDropdown.vue
git commit -m "feat(pc-web): add NotificationDropdown component"
```

---

## Task 5: 前端 - 集成到 user-layout

**Files:**
- Modify: `src/pc-web/src/views/user/user-layout.vue`

- [ ] **Step 1: 替换通知按钮**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserSidebar from '@/components/user/user-sidebar.vue'
import NotificationDropdown from '@/components/notification/NotificationDropdown.vue'

defineOptions({
  name: 'UserLayout',
})

const route = useRoute()
const authStore = useAuthStore()
const activePath = computed(() => route.path)
</script>

<template>
  <!-- ... 其他内容保持不变 ... -->
  
  <!-- 替换原来的通知按钮 -->
  <NotificationDropdown />
  
  <!-- ... 其他内容保持不变 ... -->
</template>
```

- [ ] **Step 2: 提交**

```bash
git add src/pc-web/src/views/user/user-layout.vue
git commit -m "feat(pc-web): integrate NotificationDropdown into user-layout"
```

---

## Task 6: 前端 - 通知列表页面

**Files:**
- Create: `src/pc-web/src/views/user/notifications.vue`
- Modify: `src/pc-web/src/router/routes.ts`

### 6.1 notifications.vue

- [ ] **Step 1: 创建通知列表页面**

```vue
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

    <div v-else class="space-y-3">
      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        :class="{ 'border-l-4 border-l-primary': !notification.isRead }"
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
```

### 6.2 添加路由

- [ ] **Step 2: 在 routes.ts 添加路由**

```typescript
{
  path: 'notifications',
  name: 'user-notifications',
  component: () => import('@/views/user/notifications.vue'),
  meta: { title: '通知中心' },
},
```

- [ ] **Step 3: 提交**

```bash
git add src/pc-web/src/views/user/notifications.vue
git add src/pc-web/src/router/routes.ts
git commit -m "feat(pc-web): add notifications page and route"
```

---

## Task 7: 后端 - 集成通知发送

**Files:**
- Modify: `src/api/src/modules/resources/resources.service.ts` (审核结果通知)
- Modify: `src/api/src/modules/users/users.service.ts` (账号禁用/警告通知)

- [ ] **Step 1: 在 resources.service.ts 添加审核结果通知**

在 `updateResourceStatus` 或类似方法中，审核状态变更时发送通知：

```typescript
import { createNotification } from '../notifications/notifications.service'

// 在审核状态变更后添加：
if (status === 'APPROVED' || status === 'REJECTED') {
  const title = status === 'APPROVED' ? '资源审核通过' : '资源审核被拒绝'
  const content = status === 'APPROVED'
    ? `您上传的资源《${resource.title}》已通过审核`
    : `您上传的资源《${resource.title}》未通过审核，原因：${rejectReason || '未说明'}`

  await createNotification({
    userId: resource.uploaderId,
    type: 'AUDIT_RESULT',
    title,
    content,
    metadata: { resourceId: resource.id, status },
  })
}
```

- [ ] **Step 2: 在 users.service.ts 添加账号禁用/警告通知**

```typescript
import { createNotification } from '../notifications/notifications.service'

// 在 updateUser 方法中，status 变更时添加：
if (input.status === 'BANNED') {
  await createNotification({
    userId,
    type: 'ACCOUNT_BANNED',
    title: '账号已被禁用',
    content: `您的账号因违规已被禁用，请联系客服了解详情`,
    metadata: { reason: reason || '违规行为' },
  })
}
```

- [ ] **Step 3: 提交**

```bash
git add src/api/src/modules/resources/resources.service.ts
git add src/api/src/modules/users/users.service.ts
git commit -m "feat(api): send notifications on audit result and account status change"
```

---

## 实施检查清单

完成所有任务后，执行以下验证：

- [ ] `pnpm lint` (后端和前端)
- [ ] `pnpm type-check` (后端和前端)
- [ ] `pnpm test` (如存在相关测试)
- [ ] `pnpm build` (前端构建)
- [ ] 手动测试：刷新页面，检查通知铃铛是否显示
- [ ] 手动测试：点击铃铛，检查下拉列表是否正常展示
- [ ] 手动测试：展开列表后，未读红点是否消失
- [ ] 手动测试：跳转通知列表页，检查筛选功能是否正常
