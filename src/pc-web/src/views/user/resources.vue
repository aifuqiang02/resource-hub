<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { HttpError } from '@/services/http/create-http-client'
import {
  deleteResource,
  listMyResources,
  updateResource,
  type ResourceListItem,
} from '@/services/modules/resources'

defineOptions({
  name: 'UserResourcesView',
})

type TabType = 'all' | 'approved' | 'pending' | 'offline'
type ResourceStatus = 'APPROVED' | 'PENDING' | 'OFFLINE' | 'REJECTED'

const activeTab = ref<TabType>('all')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 10
const resources = ref<ResourceListItem[]>([])
const total = ref(0)
const totalPages = ref(1)
const tabCounts = reactive({
  all: 0,
  approved: 0,
  pending: 0,
  rejected: 0,
  offline: 0,
})
const isLoading = ref(false)
const pageError = ref('')
const deletingId = ref('')
const isEditOpen = ref(false)
const editSubmitting = ref(false)
const editingResourceId = ref('')
const editError = ref('')
const editForm = reactive({
  title: '',
  category: '',
  shareLink: '',
  tags: '',
  contentMd: '',
})

const tabStatusMap: Record<TabType, ResourceStatus | undefined> = {
  all: undefined,
  approved: 'APPROVED',
  pending: 'PENDING',
  offline: 'OFFLINE',
}

const tabs = computed(() => [
  { key: 'all' as const, label: '全部', count: tabCounts.all },
  { key: 'approved' as const, label: '已通过', count: tabCounts.approved },
  { key: 'pending' as const, label: '待审核', count: tabCounts.pending },
  { key: 'offline' as const, label: '已下架', count: tabCounts.offline },
])

const statusMap: Record<ResourceStatus, { label: string; bg: string; text: string; dot: string }> = {
  APPROVED: { label: '已通过', bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  PENDING: { label: '待审核', bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  OFFLINE: { label: '已下架', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
  REJECTED: { label: '已拒绝', bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
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
    return '暂无资源记录'
  }

  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(total.value, start + resources.value.length - 1)

  return `显示 ${start} 到 ${end}，共 ${total.value} 条记录`
})

const getStatusInfo = (status: ResourceStatus) => statusMap[status]

const getCategoryName = (item: ResourceListItem) => item.category?.name || '未分类'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))

const toTagString = (tags: string[]) => tags.join(' / ')

const loadResources = async () => {
  isLoading.value = true
  pageError.value = ''

  try {
    const response = await listMyResources({
      page: currentPage.value,
      pageSize,
      status: tabStatusMap[activeTab.value],
      q: keyword.value.trim() || undefined,
    })

    resources.value = response.items
    total.value = response.pagination.total
    totalPages.value = response.pagination.totalPages
    tabCounts.all = response.tabCounts.all
    tabCounts.approved = response.tabCounts.approved
    tabCounts.pending = response.tabCounts.pending
    tabCounts.rejected = response.tabCounts.rejected
    tabCounts.offline = response.tabCounts.offline
  } catch (error) {
    pageError.value =
      error instanceof HttpError ? error.message : '资源列表加载失败，请稍后重试'
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

const openEditDialog = (item: ResourceListItem) => {
  editingResourceId.value = item.id
  editForm.title = item.title
  editForm.category = getCategoryName(item)
  editForm.shareLink = item.shareLink || ''
  editForm.tags = item.tags.join(', ')
  editForm.contentMd = item.contentMd || ''
  editError.value = ''
  isEditOpen.value = true
}

const closeEditDialog = () => {
  isEditOpen.value = false
  editingResourceId.value = ''
  editError.value = ''
}

const submitEdit = async () => {
  if (!editingResourceId.value) {
    return
  }

  if (!editForm.title.trim() || !editForm.category.trim() || !editForm.shareLink.trim() || !editForm.contentMd.trim()) {
    editError.value = '请完整填写标题、分类、分享链接和详细说明'
    return
  }

  editSubmitting.value = true
  editError.value = ''

  try {
    await updateResource(editingResourceId.value, {
      title: editForm.title.trim(),
      category: editForm.category.trim(),
      shareLink: editForm.shareLink.trim(),
      contentMd: editForm.contentMd.trim(),
      tags: editForm.tags
        .split(/[,\n/|，]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    })

    closeEditDialog()
    await loadResources()
  } catch (error) {
    editError.value =
      error instanceof HttpError ? error.message : '资源更新失败，请稍后重试'
  } finally {
    editSubmitting.value = false
  }
}

const removeResource = async (item: ResourceListItem) => {
  const confirmed = window.confirm(`确认删除“${item.title}”吗？删除后不可恢复。`)
  if (!confirmed) {
    return
  }

  deletingId.value = item.id
  pageError.value = ''

  try {
    await deleteResource(item.id)

    if (resources.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }

    await loadResources()
  } catch (error) {
    pageError.value =
      error instanceof HttpError ? error.message : '资源删除失败，请稍后重试'
  } finally {
    deletingId.value = ''
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
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">我的上传</h1>
          <p class="text-sm text-slate-500 mt-1">管理您分享的所有数字资源</p>
        </div>
        <div class="flex w-full md:w-auto items-center gap-3">
          <div class="relative flex-1 md:w-72">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              v-model="keyword"
              class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="搜索资源名称、标签或链接"
              type="text"
            >
          </div>
          <RouterLink to="/user/publish" class="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
            <span class="material-symbols-outlined text-lg">add_circle</span>
            <span>发布新资源</span>
          </RouterLink>
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
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">资源名称</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">上传日期</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">下载量</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-if="isLoading">
              <td class="px-6 py-12 text-center text-sm text-slate-500" colspan="5">正在加载资源列表...</td>
            </tr>
            <tr v-else-if="resources.length === 0">
              <td class="px-6 py-12 text-center text-sm text-slate-500" colspan="5">暂无符合条件的资源</td>
            </tr>
            <tr v-for="item in resources" v-else :key="item.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                    <span class="material-symbols-outlined">description</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ item.title }}</p>
                    <p class="text-xs text-slate-500 truncate">
                      {{ getCategoryName(item) }}
                      <span v-if="item.tags.length"> • {{ toTagString(item.tags) }}</span>
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', getStatusInfo(item.status).bg, getStatusInfo(item.status).text]">
                  <span :class="['w-1.5 h-1.5 rounded-full', getStatusInfo(item.status).dot]"></span>
                  {{ getStatusInfo(item.status).label }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ formatDate(item.createdAt) }}</td>
              <td class="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 text-center">{{ item.downloadCount.toLocaleString() }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-3">
                  <button class="text-primary hover:text-primary/80 text-sm font-bold" @click="openEditDialog(item)">编辑</button>
                  <button class="text-slate-400 hover:text-red-500 text-sm font-bold disabled:opacity-60" :disabled="deletingId === item.id" @click="removeResource(item)">
                    {{ deletingId === item.id ? '删除中...' : '删除' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800">
        <p class="text-sm text-slate-500">{{ summaryText }}</p>
        <div class="flex items-center gap-2">
          <button class="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
            <span class="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button
            v-for="page in pageNumbers"
            :key="page"
            :class="['size-8 flex items-center justify-center rounded text-sm font-medium transition-colors', page === currentPage ? 'bg-primary text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800']"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button class="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </section>

    <div v-if="isEditOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div class="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">编辑资源</h2>
            <p class="mt-1 text-sm text-slate-500">修改后会重新进入待审核状态</p>
          </div>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" @click="closeEditDialog">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4 px-6 py-6">
          <div>
            <label class="mb-2 block text-sm font-semibold">资源名称</label>
            <input v-model="editForm.title" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-primary" type="text">
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold">资源分类</label>
            <input v-model="editForm.category" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-primary" type="text">
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold">123 云盘分享链接</label>
            <input v-model="editForm.shareLink" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-primary" type="text">
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold">标签</label>
            <input v-model="editForm.tags" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-primary" placeholder="多个标签用逗号分隔" type="text">
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold">详细说明</label>
            <textarea v-model="editForm.contentMd" class="min-h-[220px] w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-primary" />
          </div>

          <div v-if="editError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {{ editError }}
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
          <button class="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800" @click="closeEditDialog">
            取消
          </button>
          <button class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60" :disabled="editSubmitting" @click="submitEdit">
            {{ editSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
