<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElRate } from 'element-plus'
import { RouterLink, useRoute } from 'vue-router'
import { HttpError } from '@/services/http/create-http-client'
import { acquireResource } from '@/services/modules/downloads'
import { hasPermission } from '@/permissions/has-permission'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/app-header.vue'
import AppFooter from '@/components/layout/app-footer.vue'
import {
  createResourceComment,
  deleteResourceComment,
  getPublicResourceDetail,
  listResourceComments,
  type ResourceComment,
  type ResourceListItem,
} from '@/services/modules/resources'

defineOptions({
  name: 'SoftwareDetailView',
})

const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref('detail')
const isLoading = ref(false)
const loadError = ref('')
const resource = ref<(ResourceListItem & { related: ResourceListItem[] }) | null>(null)
const comments = ref<ResourceComment[]>([])
const commentsLoading = ref(false)
const hasLoadedComments = ref(false)
const commentsError = ref('')
const commentSubmitting = ref(false)
const acquiring = ref(false)
const confirmAcquireOpen = ref(false)
const commentForm = ref({
  rating: 5,
  content: '',
})

const formattedCategory = computed(() => resource.value?.category?.name || '未分类')
const parsedDescription = computed(() => {
  const content = resource.value?.contentMd || resource.value?.description || ''
  return content
    .split(/\n{2,}/)
    .map((item: string) => item.trim())
    .filter(Boolean)
})
const ratingSummary = computed(() => ({
  avg: resource.value?.ratingAvg ?? 0,
  count: resource.value?.ratingCount ?? 0,
}))
const isFreeResource = computed(() => (resource.value?.pointsCost ?? 0) === 0)
const canAcquire = computed(() => resource.value?.status === 'APPROVED')
const canComment = computed(() => resource.value?.status === 'APPROVED')
const canReviewPreviewOpen = computed(
  () => !canAcquire.value && hasPermission(authStore.roles, ['admin', 'editor']),
)
const acquireSummaryText = computed(() => {
  if (!resource.value) {
    return ''
  }

  if (!canAcquire.value) {
    return '当前资源尚未上架，仅供审核预览，暂不可获取。'
  }

  if (resource.value.owned) {
    return '你已经获取过该资源，本次再次打开不会重复扣积分。'
  }

  if (isFreeResource.value) {
    return '该资源当前免费，确认后将直接记录获取历史并打开分享链接。'
  }

  return `确认后将扣除 ${resource.value.pointsCost} 积分，并打开 123 云盘分享链接。`
})

const openAcquireDialog = () => {
  if (!authStore.isAuthenticated) {
    window.alert('请先登录后再获取资源')
    return
  }

  if (!resource.value) {
    return
  }

  if (canReviewPreviewOpen.value) {
    if (!resource.value.shareLink) {
      window.alert('当前资源暂未配置分享地址')
      return
    }

    window.open(resource.value.shareLink, '_blank', 'noopener,noreferrer')
    return
  }

  if (!canAcquire.value) {
    window.alert('当前资源尚未上架，暂不可获取')
    return
  }

  confirmAcquireOpen.value = true
}

const confirmAcquire = async () => {
  if (!resource.value) {
    return
  }

  acquiring.value = true

  try {
    const result = await acquireResource(resource.value.id)
    authStore.patchProfile({
      pointsBalance: result.currentPointsBalance,
    })
    confirmAcquireOpen.value = false
    window.open(result.shareLink, '_blank', 'noopener,noreferrer')
    await loadResource()
  } catch (error) {
    window.alert(error instanceof HttpError ? error.message : '获取资源失败，请稍后重试')
  } finally {
    acquiring.value = false
  }
}

const loadComments = async () => {
  if (!route.params.id) {
    return
  }

  if (!canComment.value) {
    comments.value = []
    commentsError.value = ''
    return
  }

  commentsLoading.value = true
  commentsError.value = ''

  try {
    const response = await listResourceComments(String(route.params.id), 1, 10)
    comments.value = response.items
  } catch (error) {
    commentsError.value =
      error instanceof HttpError ? error.message : '评论加载失败，请稍后重试'
  } finally {
    commentsLoading.value = false
    hasLoadedComments.value = true
  }
}

const submitComment = async () => {
  if (!authStore.isAuthenticated) {
    window.alert('请先登录后再评价')
    return
  }

  if (!resource.value) {
    return
  }

  if (!canComment.value) {
    window.alert('当前资源未上架，暂不开放用户评价')
    return
  }

  if (!commentForm.value.content.trim()) {
    window.alert('请填写评价内容')
    return
  }

  commentSubmitting.value = true

  try {
    await createResourceComment(resource.value.id, {
      rating: commentForm.value.rating,
      content: commentForm.value.content.trim(),
    })

    commentForm.value = {
      rating: 5,
      content: '',
    }

    await Promise.all([loadResource(), loadComments()])
  } catch (error) {
    window.alert(error instanceof HttpError ? error.message : '评价提交失败，请稍后重试')
  } finally {
    commentSubmitting.value = false
  }
}

const handleDeleteComment = async (commentId: string) => {
  if (!resource.value) {
    return
  }

  try {
    await deleteResourceComment(resource.value.id, commentId)
    await Promise.all([loadResource(), loadComments()])
  } catch (error) {
    window.alert(error instanceof HttpError ? error.message : '删除评价失败，请稍后重试')
  }
}

const loadResource = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    resource.value = await getPublicResourceDetail(String(route.params.id))
  } catch (error) {
    loadError.value =
      error instanceof HttpError ? error.message : '资源详情加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadResource()
  await loadComments()
})
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display">
    <AppHeader :show-nav="true" :show-user="true" :show-login="false" />

    <main class="flex flex-1 justify-center py-8 min-h-[60vh]">
      <div class="layout-content-container flex flex-col max-w-[960px] flex-1 px-4">
        <div v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {{ loadError }}
        </div>
        <template v-else-if="resource">
          <div class="flex flex-col md:flex-row gap-6 items-start md:items-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div class="bg-primary/5 rounded-2xl p-4 flex items-center justify-center w-32 h-32 shrink-0 border border-primary/10 overflow-hidden">
              <img v-if="resource.screenshotUrl" :src="resource.screenshotUrl" :alt="resource.title" class="h-full w-full object-cover rounded-xl">
              <span v-else class="material-symbols-outlined text-primary text-[64px]">folder_open</span>
            </div>
            <div class="flex flex-col flex-1 gap-1">
              <h1 class="text-slate-900 dark:text-white text-3xl font-bold leading-tight">{{ resource.title }}</h1>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span class="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{{ formattedCategory }}</span>
                <span v-if="resource.tags.length" class="text-slate-600 dark:text-slate-400 text-sm">标签：{{ resource.tags.join(' / ') }}</span>
              </div>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-slate-600 dark:text-slate-400 text-sm">
                <div class="flex items-center gap-1 text-yellow-500">
                  <span class="material-symbols-outlined text-[18px] fill-1">star</span>
                  <span>{{ ratingSummary.avg.toFixed(1) }} ({{ ratingSummary.count }}条评价)</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[18px]">download_for_offline</span>
                  <span>{{ resource.downloadCount }} 次下载</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[18px]">schedule</span>
                  <span>{{ new Date(resource.createdAt).toLocaleDateString('zh-CN') }}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2 w-full md:w-auto">
              <button class="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60" :disabled="acquiring || (!canAcquire && !canReviewPreviewOpen)" @click="openAcquireDialog">
                <span class="material-symbols-outlined">download</span>
                {{ canReviewPreviewOpen ? '审核预览链接' : !canAcquire ? '审核预览中' : acquiring ? '获取中...' : (resource.owned ? '再次打开' : '前往获取') }}
              </button>
              <div class="flex items-center justify-center gap-2 py-2 px-4 bg-primary/5 border border-primary/20 rounded-lg text-primary">
                <span class="material-symbols-outlined text-[20px]">{{ isFreeResource ? 'verified' : 'payments' }}</span>
                <span class="text-sm font-bold">{{ isFreeResource ? '免费获取' : `所需积分：${resource.pointsCost} 积分` }}</span>
              </div>
            </div>
          </div>

          <div class="mt-8 border-b border-slate-200 dark:border-slate-800 relative bg-background-light dark:bg-background-dark z-40">
            <div class="flex gap-8">
              <button
                :class="['flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-2 transition-colors', activeTab === 'detail' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary']"
                @click="activeTab = 'detail'"
              >
                <span class="text-sm font-bold tracking-[0.015em]">详情</span>
              </button>
              <button
                :class="['flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 px-2 transition-colors', activeTab === 'download' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary']"
                @click="activeTab = 'download'"
              >
                <span class="text-sm font-bold tracking-[0.015em]">获取说明</span>
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'detail'" class="markdown-content bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 mt-6 shadow-sm">
            <h2>资源说明</h2>
            <p v-for="(paragraph, index) in parsedDescription" :key="index">{{ paragraph }}</p>
          </div>

          <div v-if="activeTab === 'download'" class="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 mt-6 shadow-sm space-y-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">获取方式</h2>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              {{
                canReviewPreviewOpen
                  ? '当前为审核预览模式。你可以直接打开发布者填写的分享链接，核查链接是否有效以及资源内容是否正确。'
                  : '平台当前通过 123 云盘分享链接提供资源访问入口。点击下方按钮后，将跳转到发布者提供的分享地址。'
              }}
            </p>
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-4 break-all text-sm text-slate-600 dark:text-slate-300">
              {{ resource.shareLink || '当前资源暂未配置分享地址' }}
            </div>
            <button class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-60" :disabled="acquiring || (!canAcquire && !canReviewPreviewOpen)" @click="openAcquireDialog">
              <span class="material-symbols-outlined">open_in_new</span>
              {{
                canReviewPreviewOpen
                  ? '审核预览：打开分享链接'
                  : !canAcquire
                    ? '当前不可获取'
                    : acquiring
                      ? '获取中...'
                      : (resource.owned ? '再次打开分享链接' : '确认获取并打开')
              }}
            </button>
            <p v-if="canReviewPreviewOpen" class="text-xs text-amber-600 dark:text-amber-400">
              审核预览不会扣积分，也不会记录到下载历史。
            </p>
          </div>

          <div v-if="resource.related.length" class="mt-10 mb-20">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">相关推荐</h2>
              <RouterLink to="/" class="text-sm font-semibold text-primary hover:underline">查看更多</RouterLink>
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <RouterLink
                v-for="item in resource.related"
                :key="item.id"
                :to="`/software/${item.id}`"
                class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div class="mb-3 flex items-center justify-between gap-3">
                  <h3 class="line-clamp-1 text-base font-bold text-slate-900 dark:text-white">{{ item.title }}</h3>
                  <span :class="['shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold', item.pointsCost === 0 ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary']">
                    {{ item.pointsCost === 0 ? '免费' : `${item.pointsCost} 积分` }}
                  </span>
                </div>
                <p class="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {{ item.description || item.contentMd || '暂无详细说明' }}
                </p>
                <div class="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{{ item.category?.name || '未分类' }}</span>
                  <span>{{ item.downloadCount }} 次下载</span>
                </div>
              </RouterLink>
            </div>
          </div>

          <div class="mt-10 mb-20">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white">用户评价</h2>
              <span v-if="commentsLoading && hasLoadedComments" class="text-xs text-primary">刷新中...</span>
            </div>

            <div class="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div class="mb-4 flex items-center gap-3">
                <label class="text-sm font-semibold text-slate-900 dark:text-white">评分</label>
                <ElRate v-model="commentForm.rating" />
              </div>
              <textarea
                v-model="commentForm.content"
                class="min-h-[120px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-primary"
                placeholder="写下你对这个资源的使用感受..."
                :disabled="!canComment"
              />
              <div class="mt-4 flex justify-end">
                <button class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60" :disabled="commentSubmitting || !canComment" @click="submitComment">
                  {{ commentSubmitting ? '提交中...' : '我要评价' }}
                </button>
              </div>
              <p v-if="!canComment" class="mt-3 text-xs text-slate-500">
                当前资源未上架，暂不开放用户评价。
              </p>
            </div>

            <div v-if="commentsError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {{ commentsError }}
            </div>
            <div v-else-if="commentsLoading && !hasLoadedComments" class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-10 text-center text-sm text-slate-500">
              正在加载评论...
            </div>
            <div v-else-if="!commentsLoading && comments.length === 0" class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-10 text-center text-sm text-slate-500">
              暂无评论，来做第一个评价的人吧。
            </div>
            <div v-else class="grid gap-4">
              <div v-for="comment in comments" :key="comment.id" class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                      <img v-if="comment.user.avatarUrl" :src="comment.user.avatarUrl" :alt="comment.user.name" class="h-full w-full object-cover">
                      <span v-else class="material-symbols-outlined text-slate-400">person</span>
                    </div>
                    <div>
                      <p class="font-bold text-slate-900 dark:text-white">{{ comment.user.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ new Date(comment.createdAt).toLocaleString('zh-CN') }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <ElRate :model-value="comment.rating" disabled />
                    <button v-if="comment.user.id === authStore.profile?.id" class="text-red-500 hover:text-red-600 p-1" @click="handleDeleteComment(comment.id)">
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <Teleport to="body">
      <div v-if="confirmAcquireOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" @click.self="confirmAcquireOpen = false">
        <div class="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">确认获取资源</h3>
            <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" @click="confirmAcquireOpen = false">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="space-y-4 px-6 py-6">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
              {{ acquireSummaryText }}
            </div>
            <div v-if="resource" class="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p><span class="font-semibold text-slate-900 dark:text-white">资源名称：</span>{{ resource.title }}</p>
              <p><span class="font-semibold text-slate-900 dark:text-white">分类：</span>{{ formattedCategory }}</p>
              <p><span class="font-semibold text-slate-900 dark:text-white">积分：</span>{{ isFreeResource ? '免费' : `${resource.pointsCost} 积分` }}</p>
            </div>
          </div>
          <div class="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
            <button class="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" @click="confirmAcquireOpen = false">
              取消
            </button>
            <button class="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60" :disabled="acquiring || !canAcquire" @click="confirmAcquire">
              {{ acquiring ? '处理中...' : '确认并打开' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <AppFooter />
  </div>
</template>

<style scoped>
.markdown-content h2 {
  @apply text-xl font-bold border-b border-slate-200 dark:border-slate-700 pb-2 mb-8 mt-20 text-slate-900 dark:text-slate-100;
}
.markdown-content h2:first-child {
  @apply mt-0;
}
.markdown-content p {
  @apply text-slate-700 dark:text-slate-300 leading-relaxed mb-6;
}
</style>
