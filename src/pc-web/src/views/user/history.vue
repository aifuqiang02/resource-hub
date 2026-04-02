<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { HttpError } from '@/services/http/create-http-client'
import { listDownloadHistory, type DownloadHistoryItem } from '@/services/modules/downloads'

defineOptions({
  name: 'DownloadHistoryView',
})

const history = ref<DownloadHistoryItem[]>([])
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const pageError = ref('')

const pageNumbers = computed(() => {
  const maxVisible = 5
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  const adjustedStart = Math.max(1, end - maxVisible + 1)

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
})

const summaryText = computed(() => {
  if (total.value === 0) {
    return '暂无下载记录'
  }

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(total.value, start + history.value.length - 1)

  return `显示 ${start} 到 ${end} 条，共 ${total.value} 条记录`
})

const loadHistory = async () => {
  isLoading.value = true
  pageError.value = ''

  try {
    const response = await listDownloadHistory(currentPage.value, pageSize)
    history.value = response.items
    total.value = response.pagination.total
    totalPages.value = response.pagination.totalPages
  } catch (error) {
    pageError.value =
      error instanceof HttpError ? error.message : '下载历史加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return
  }

  currentPage.value = page
}

const openShareLink = (item: DownloadHistoryItem) => {
  if (!item.resource.shareLink) {
    window.alert('当前资源暂未配置分享地址')
    return
  }

  window.open(item.resource.shareLink, '_blank', 'noopener,noreferrer')
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

watch(currentPage, async () => {
  await loadHistory()
})

onMounted(async () => {
  await loadHistory()
})
</script>

<template>
  <div class="w-full">
    <section class="flex flex-col gap-6">
      <nav class="flex items-center gap-2 text-sm">
        <RouterLink to="/user" class="text-slate-500 hover:text-primary">个人中心</RouterLink>
        <span class="material-symbols-outlined text-slate-400 text-xs leading-none">chevron_right</span>
        <span class="text-slate-900 dark:text-white font-medium">下载历史</span>
      </nav>

      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">下载历史</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm">在这里您可以查看并重新打开过去获取过的资源分享链接。</p>
      </div>

      <div v-if="pageError" class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {{ pageError }}
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">资源名称</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">版本</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">获取日期</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">消耗积分</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="isLoading">
                <td class="px-6 py-12 text-center text-sm text-slate-500" colspan="5">正在加载下载历史...</td>
              </tr>
              <tr v-else-if="history.length === 0">
                <td class="px-6 py-12 text-center text-sm text-slate-500" colspan="5">暂无下载记录</td>
              </tr>
              <tr v-for="item in history" v-else :key="item.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span class="material-symbols-outlined text-slate-400">description</span>
                    </div>
                    <span class="font-semibold text-slate-900 dark:text-white text-sm">{{ item.resource.title }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ item.version.version }}</td>
                <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ formatDate(item.downloadedAt) }}</td>
                <td class="px-6 py-4">
                  <span v-if="item.pointsSpent === 0" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    免费重开
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    -{{ item.pointsSpent }} 积分
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm" @click="openShareLink(item)">
                    <span class="material-symbols-outlined text-sm">open_in_new</span>
                    再次打开
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
          <p class="text-xs text-slate-500">{{ summaryText }}</p>
          <div class="flex gap-1">
            <button class="h-8 w-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-40" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
              <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              v-for="page in pageNumbers"
              :key="page"
              :class="['h-8 w-8 flex items-center justify-center rounded text-xs font-bold transition-colors', page === currentPage ? 'bg-primary text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100']"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <button class="h-8 w-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-40" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
              <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
