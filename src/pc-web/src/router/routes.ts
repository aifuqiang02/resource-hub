import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      guestOnly: true,
    },
  },
  {
    path: '/software/:id',
    name: 'software-detail',
    component: () => import('@/views/software/detail.vue'),
    meta: {
      title: '软件详情',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: '工作台',
      requiresAuth: true,
      roles: ['admin', 'editor', 'viewer'],
    },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/index.vue'),
    meta: {
      title: '管理页',
      requiresAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/user',
    name: 'user-center',
    component: () => import('@/views/user/user-layout.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true,
    },
    children: [
      {
        path: '',
        name: 'user-overview',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '账户概览' },
      },
      {
        path: 'resources',
        name: 'user-resources',
        component: () => import('@/views/user/resources.vue'),
        meta: { title: '我的上传' },
      },
      {
        path: 'review',
        name: 'user-review',
        component: () => import('@/views/user/review.vue'),
        meta: { title: '资源审核', roles: ['admin', 'editor'] },
      },
      {
        path: 'history',
        name: 'download-history',
        component: () => import('@/views/user/history.vue'),
        meta: { title: '下载历史' },
      },
      {
        path: 'recharge',
        name: 'points-recharge',
        component: () => import('@/views/user/recharge.vue'),
        meta: { title: '积分充值' },
      },
      {
        path: 'points',
        name: 'user-points',
        component: () => import('@/views/user/points.vue'),
        meta: { title: '积分流水' },
      },
      {
        path: 'notifications',
        name: 'user-notifications',
        component: () => import('@/views/user/notifications.vue'),
        meta: { title: '通知中心' },
      },
      {
        path: 'setting',
        name: 'user-setting',
        component: () => import('@/views/user/setting.vue'),
        meta: { title: '设置中心' },
      },
      {
        path: 'publish',
        name: 'user-publish',
        component: () => import('@/views/user/publish.vue'),
        meta: { title: '发布新资源' },
      },
    ],
  },
  {
    path: '/ai-upload',
    name: 'ai-upload',
    component: () => import('@/views/ai-upload.vue'),
    meta: {
      title: 'AI协同上传',
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/about.vue'),
    meta: {
      title: '关于我们',
    },
  },
  {
    path: '/agreement',
    name: 'agreement',
    component: () => import('@/views/agreement.vue'),
    meta: {
      title: '用户协议',
    },
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/views/forbidden/index.vue'),
    meta: {
      title: '无权限访问',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/not-found/index.vue'),
    meta: {
      title: '页面未找到',
    },
  },
]
