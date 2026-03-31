# 通知功能设计文档

**日期**：2026-03-31

## 1. 需求概述

为 resource-hub 项目添加通知功能，支持以下通知类型：
- 资源审核结果通知（AUDIT_RESULT）
- 账号禁用通知（ACCOUNT_BANNED）
- 账号警告通知（ACCOUNT_WARNED）

## 2. 设计原则

- 轻量实现，数据持久化
- 页面刷新时加载通知
- 下拉列表展示最新通知，支持标记已读
- 查看列表自动标记已读

## 3. 数据模型

### 3.1 数据库表：notification

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键（UUID） |
| userId | string | 接收用户ID |
| type | enum | AUDIT_RESULT / ACCOUNT_BANNED / ACCOUNT_WARNED |
| title | string | 通知标题 |
| content | string | 通知内容 |
| metadata | jsonb | 附加数据（如审核ID、被禁原因等） |
| isRead | boolean | 是否已读，默认false |
| createdAt | datetime | 创建时间 |
| readAt | datetime | 阅读时间 |

### 3.2 Prisma Schema

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  content   String
  metadata  Json     @default("{}")
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  readAt    DateTime?

  @@index([userId, createdAt])
  @@index([userId, isRead])
}

enum NotificationType {
  AUDIT_RESULT
  ACCOUNT_BANNED
  ACCOUNT_WARNED
}
```

## 4. API 设计

### 4.1 获取通知列表

```
GET /notifications
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "uuid",
        "type": "AUDIT_RESULT",
        "title": "资源审核结果",
        "content": "您上传的资源《xxx》已通过审核",
        "metadata": { "resourceId": "xxx" },
        "isRead": false,
        "createdAt": "2026-03-31T10:00:00Z",
        "readAt": null
      }
    ],
    "unreadCount": 3
  }
}
```

### 4.2 标记单条已读

```
PATCH /notifications/:id/read
```

**响应：**
```json
{
  "code": 0,
  "message": "success"
}
```

### 4.3 标记全部已读

```
PATCH /notifications/read
```

**响应：**
```json
{
  "code": 0,
  "message": "success"
}
```

## 5. 前端实现

### 5.1 类型定义

```typescript
// src/pc-web/src/types/notification.ts

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
}
```

### 5.2 Store

```typescript
// src/pc-web/src/stores/notification.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/types/notification'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)

  async function fetchNotifications() {
    // 调用 GET /notifications
  }

  async function markRead(id: string) {
    // 调用 PATCH /notifications/:id/read
  }

  async function markAllRead() {
    // 调用 PATCH /notifications/read
  }

  return { notifications, unreadCount, fetchNotifications, markRead, markAllRead }
})
```

### 5.3 组件：NotificationDropdown.vue

- 铃铛按钮 + 红点（unreadCount > 0 时显示红点）
- 下拉列表展示最新 5 条通知
- 点击"查看全部"跳转 /notifications 页面
- 展开列表时自动调用 `markAllRead()`

### 5.4 页面：/notifications

- 通知列表页，展示全部通知
- 支持按类型筛选（全部/审核结果/禁用/警告）
- 展示已读/未读状态
- 刷新页面时调用 `fetchNotifications()`

## 6. 触发场景

| 通知类型 | 触发时机 |
|----------|----------|
| AUDIT_RESULT | 管理员审核资源通过/拒绝时 |
| ACCOUNT_BANNED | 管理员禁用用户账号时 |
| ACCOUNT_WARNED | 管理员发送账号警告时 |

后端在执行上述操作时，同步插入 notification 记录。

## 7. 实现任务

### 后端
1. 在 Prisma schema 中添加 Notification 模型和 NotificationType 枚举
2. 创建 notification.module.ts（路由、控制器、服务）
3. 实现 GET /notifications 接口
4. 实现 PATCH /notifications/:id/read 接口
5. 实现 PATCH /notifications/read 接口
6. 在现有业务逻辑中（审核、禁用、警告）添加发送通知的逻辑

### 前端
1. 添加类型定义 `src/pc-web/src/types/notification.ts`
2. 创建 notification API 文件
3. 创建 notification Store
4. 创建 NotificationDropdown.vue 组件
5. 集成到 user-layout.vue
6. 创建 /notifications 页面
7. 添加路由配置
