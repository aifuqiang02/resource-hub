<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { hasPermission } from '@/permissions/has-permission'

defineProps<{
  activePath?: string
}>()

const authStore = useAuthStore()
const canReviewResources = computed(() => hasPermission(authStore.roles, ['admin', 'editor']))
</script>

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
    <div class="mb-6 px-2">
      <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">个人工作台</h3>
    </div>
    <nav class="space-y-1">
      <RouterLink
        to="/user"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors',
          activePath === '/user'
            ? 'bg-primary/10 text-primary'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <span class="material-symbols-outlined">dashboard</span>
        <span>账户概览</span>
      </RouterLink>
      <RouterLink
        to="/user/history"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors',
          activePath === '/user/history'
            ? 'bg-primary/10 text-primary'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <span class="material-symbols-outlined">download</span>
        <span>下载历史</span>
      </RouterLink>
      <RouterLink
        to="/user/recharge"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors',
          activePath === '/user/recharge'
            ? 'bg-primary/10 text-primary'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <span class="material-symbols-outlined">account_balance_wallet</span>
        <span>积分管理</span>
      </RouterLink>
      <RouterLink
        to="/user/points"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors',
          activePath === '/user/points'
            ? 'bg-primary/10 text-primary'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <span class="material-symbols-outlined">receipt_long</span>
        <span>积分流水</span>
      </RouterLink>
      <RouterLink
        to="/user/resources"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors',
          activePath === '/user/resources'
            ? 'bg-primary/10 text-primary'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <span class="material-symbols-outlined">cloud_upload</span>
        <span>我的上传</span>
      </RouterLink>
      <RouterLink
        v-if="canReviewResources"
        to="/user/review"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors',
          activePath === '/user/review'
            ? 'bg-primary/10 text-primary'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        ]"
      >
        <span class="material-symbols-outlined">fact_check</span>
        <span>资源审核</span>
      </RouterLink>

    </nav>
  </div>
</template>
