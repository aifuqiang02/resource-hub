<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { HttpError } from '@/services/http/create-http-client'
import { listMyPointTransactions, type DashboardPointTransaction } from '@/services/modules/users'

defineOptions({
  name: 'UserPointsView',
})

const records = ref<DashboardPointTransaction[]>([])
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)
const totalPages = ref(1)
const isLoading = ref(false)
const pageError = ref('')

const transactionLabelMap: Record<string, string> = {
  RECHARGE: '积分充值',
  SPEND: '资源获取',
  REFUND: '积分退款',
}

const pageNumbers = computed(() => {
  const maxVisible = 5
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  const adjustedStart = Math.max(1, end - maxVisible + 1)

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
})

const summaryText = computed(() => {
  if (total.value === 0) {
    return '暂无积分流水'
  }

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(total.value, start + records.value.length - 1)

  return `显示 ${start} 到 ${end} 条，共 ${total.value} 条记录`
})

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const loadRecords = async () => {
  isLoading.value = true
  pageError.value = ''

  try {
    const response = await listMyPointTransactions(currentPage.value, pageSize)
    records.value = response.items
    total.value = response.pagination.total
    totalPages.value = response.pagination.totalPages
  } catch (error) {
    pageError.value =
      error instanceof HttpError ? error.message : '积分流水加载失败，请稍后重试'
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

watch(currentPage, async () => {
  await loadRecords()
})

onMounted(async () => {
  await loadRecords()
})
</script>

<template>
  <div class="w-full">
    <section class="flex flex-col gap-6">
      <nav class="flex items-center gap-2 text-sm">
        <RouterLink to="/user" class="text-slate-500 hover:text-primary">个人中心</RouterLink>
        <span class="material-symbols-outlined text-slate-400 text-xs leading-none">chevron_right</span>
        <span class="text-slate-900 dark:text-white font-medium">积分流水</span>
      </nav>

      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">积分流水</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm">查看积分充值、资源获取和退款的完整变动记录。</p>
      </div>

      <div v-if="pageError" class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
        {{ pageError }}
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
              <tr>
                <th class="px-6 py-3 font-medium">类型/描述</th>
                <th class="px-6 py-3 font-medium">变动</th>
                <th class="px-6 py-3 font-medium">余额</th>
                <th class="px-6 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="isLoading">
                <td class="px-6 py-12 text-center text-slate-500" colspan="4">正在加载积分流水...</td>
              </tr>
              <tr v-else-if="records.length === 0">
                <td class="px-6 py-12 text-center text-slate-500" colspan="4">暂无积分流水</td>
              </tr>
              <tr v-for="item in records" v-else :key="item.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4">
                  <p class="font-medium text-slate-900 dark:text-white">{{ transactionLabelMap[item.type] || item.type }}</p>
                  <p class="text-[10px] text-slate-400">{{ item.referenceType || '-' }}</p>
                </td>
                <td class="px-6 py-4 font-medium" :class="item.delta >= 0 ? 'text-green-600' : 'text-red-500'">
                  {{ item.delta >= 0 ? `+${item.delta}` : item.delta }}
                </td>
                <td class="px-6 py-4 text-slate-700 dark:text-slate-300">{{ item.balanceAfter }}</td>
                <td class="px-6 py-4 text-slate-500 text-xs">{{ formatDate(item.createdAt) }}</td>
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
