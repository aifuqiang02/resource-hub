<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { HttpError } from '@/services/http/create-http-client'
import {
  listReviewResources,
  reviewResourceStatus,
  type ResourceListItem,
} from '@/services/modules/resources'

defineOptions({
  name: 'UserReviewView',
})

type TabType = 'all' | 'pending' | 'approved' | 'rejected' | 'offline'

const activeTab = ref<TabType>('pending')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 10
const resources = ref<ResourceListItem[]>([])
const total = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const pageError = ref('')
const actingId = ref('')
const tabCounts = ref({
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  offline: 0,
})

const tabs = computed(() => [
  { key: 'all' as const, label: '全部', count: tabCounts.value.all },
  { key: 'pending' as const, label: '待审核', count: tabCounts.value.pending },
  { key: 'approved' as const, label: '已通过', count: tabCounts.value.approved },
  { key: 'rejected' as const, label: '已拒绝', count: tabCounts.value.rejected },
  { key: 'offline' as const, label: '已下架', count: tabCounts.value.offline },
])

const statusMap = {
  PENDING: { label: '待审核', badge: 'bg-amber-100 text-amber-700' },
  APPROVED: { label: '已通过', badge: 'bg-green-100 text-green-700' },
  REJECTED: { label: '已拒绝', badge: 'bg-red-100 text-red-700' },
  OFFLINE: { label: '已下架', badge: 'bg-slate-100 text-slate-700' },
}

const pageNumbers = computed(() => {
  const maxVisible = 5
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  const adjustedStart = Math.max(1, end - maxVisible + 1)

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
})

const tabStatusMap: Record<TabType, 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE' | undefined> = {
  all: undefined,
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  offline: 'OFFLINE',
}

const loadResources = async () => {
  isLoading.value = true
  pageError.value = ''

  try {
    const response = await listReviewResources({
      page: currentPage.value,
      pageSize,
      status: tabStatusMap[activeTab.value],
      q: keyword.value.trim() || undefined,
    })

    resources.value = response.items
    total.value = response.pagination.total
    totalPages.value = response.pagination.totalPages
    tabCounts.value = response.tabCounts
  } catch (error) {
    pageError.value =
      error instanceof HttpError ? error.message : '审核列表加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const actReview = async (item: ResourceListItem, status: 'APPROVED' | 'REJECTED' | 'OFFLINE') => {
  actingId.value = item.id

  try {
    await reviewResourceStatus(item.id, status)
    await loadResources()
  } catch (error) {
    pageError.value =
      error instanceof HttpError ? error.message : '审核操作失败，请稍后重试'
  } finally {
    actingId.value = ''
  }
}

watch(activeTab, async () => {
  currentPage.value = 1
  await loadResources()
})

watch(currentPage, async () => {
  await loadResources()
})

let searchTimer: number | undefined
watch(keyword, () => {
  if (searchTimer) {
    window.clearTimeout(searchTimer)
  }

  searchTimer = window.setTimeout(async () => {
    currentPage.value = 1
    await loadResources()
  }, 300)
})

onMounted(async () => {
  await loadResources()
})
</script>

<template>
  <div class="w-full">
    <section class="min-w-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">资源审核</h1>
          <p class="text-sm text-slate-500 mt-1">审核用户提交的资源，控制资源上架状态。</p>
        </div>
        <div class="relative flex-1 md:w-72">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            v-model="keyword"
            class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="搜索资源标题、作者或分类"
            type="text"
          >
        </div>
      </div>

      <div class="px-6 border-b border-slate-100 dark:border-slate-800">
        <div class="flex gap-8 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap', activeTab === tab.key ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300']"
            @click="activeTab = tab.key"
          >
            {{ tab.label }} ({{ tab.count }})
          </button>
        </div>
      </div>

      <div v-if="pageError" class="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {{ pageError }}
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">资源</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">作者</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">提交时间</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td class="px-6 py-12 text-center text-sm text-slate-500" colspan="5">正在加载审核列表...</td>
            </tr>
            <tr v-else-if="resources.length === 0">
              <td class="px-6 py-12 text-center text-sm text-slate-500" colspan="5">暂无待处理资源</td>
            </tr>
            <tr v-for="item in resources" v-else :key="item.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <img v-if="item.screenshotUrl" :src="item.screenshotUrl" :alt="item.title" class="h-full w-full object-cover">
                    <div v-else class="flex h-full w-full items-center justify-center">
                      <span class="material-symbols-outlined text-primary">folder_open</span>
                    </div>
                  </div>
                  <div class="min-w-0">
                    <RouterLink
                      :to="`/software/${item.id}`"
                      class="truncate text-sm font-semibold text-slate-900 hover:text-primary dark:text-white dark:hover:text-primary"
                      target="_blank"
                    >
                      {{ item.title }}
                    </RouterLink>
                    <p class="truncate text-xs text-slate-500">{{ item.category?.name || '未分类' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {{ item.uploader?.nickname || item.uploader?.email || '未知用户' }}
              </td>
              <td class="px-6 py-4">
                <span :class="['inline-flex rounded-full px-2.5 py-1 text-xs font-medium', statusMap[item.status].badge]">
                  {{ statusMap[item.status].label }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ formatDate(item.createdAt) }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button class="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60" :disabled="actingId === item.id || item.status === 'APPROVED'" @click="actReview(item, 'APPROVED')">
                    通过
                  </button>
                  <button class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60" :disabled="actingId === item.id || item.status === 'REJECTED'" @click="actReview(item, 'REJECTED')">
                    拒绝
                  </button>
                  <button class="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60" :disabled="actingId === item.id || item.status === 'OFFLINE'" @click="actReview(item, 'OFFLINE')">
                    下架
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800">
        <p class="text-sm text-slate-500">共 {{ total }} 条记录</p>
        <div class="flex items-center gap-2">
          <button class="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40" :disabled="currentPage <= 1" @click="currentPage -= 1">
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button
            v-for="page in pageNumbers"
            :key="page"
            :class="['size-8 flex items-center justify-center rounded text-sm font-medium transition-colors', page === currentPage ? 'bg-primary text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800']"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button class="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40" :disabled="currentPage >= totalPages" @click="currentPage += 1">
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
