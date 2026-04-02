<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { appEnv } from '@/config/env'
import { rechargeService } from '@/services/modules/recharge'

const props = defineProps<{
  show: boolean
  points: number
  price: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success', payload: { bizId: string; points: number; amount: number; paidAt: string | null }): void
}>()

const qrCodeUrl = ref('')
const pollUrl = ref('')
const bizId = ref('')
const paymentStatus = ref<'loading' | 'pending' | 'paid' | 'expired' | 'closed' | 'error'>('loading')
const errorMessage = ref('')
let pollInterval: ReturnType<typeof setInterval> | null = null

async function createSession() {
  paymentStatus.value = 'loading'
  qrCodeUrl.value = ''
  errorMessage.value = ''

  try {
    const result = await rechargeService.createSession(props.points)
    bizId.value = result.bizId
    qrCodeUrl.value = result.qrCodeUrl
    pollUrl.value = result.pollUrl
    paymentStatus.value = 'pending'
    startPolling()
  } catch (err: unknown) {
    paymentStatus.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : '创建支付会话失败'
  }
}

function startPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
  }

  pollInterval = setInterval(async () => {
    try {
      const session = await rechargeService.pollStatus(bizId.value)
      paymentStatus.value = session.status

      if (session.status === 'paid') {
        stopPolling()
        setTimeout(() => {
          emit('success', {
            bizId: session.bizId,
            points: props.points,
            amount: session.amount,
            paidAt: session.paidAt,
          })
          emit('close')
        }, 2500)
      } else if (session.status === 'expired' || session.status === 'closed') {
        stopPolling()
      }
    } catch (error) {
      console.error('Poll error:', error)
    }
  }, 2500)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

function handleClose() {
  stopPolling()
  emit('close')
}

function handleRetry() {
  createSession()
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      createSession()
    } else {
      stopPolling()
      qrCodeUrl.value = ''
      bizId.value = ''
      paymentStatus.value = 'loading'
    }
  },
)

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="handleClose"
    >
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">微信支付</h3>
          <button
            class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            @click="handleClose"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6">
          <div class="text-center mb-6">
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">支付金额</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-white">¥{{ price.toFixed(2) }}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ points }} 积分</p>
          </div>

          <div
            v-if="paymentStatus === 'loading'"
            class="flex flex-col items-center justify-center py-12"
          >
            <span class="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
            <p class="mt-4 text-slate-500 dark:text-slate-400">正在生成支付二维码...</p>
          </div>

          <div
            v-else-if="paymentStatus === 'error'"
            class="flex flex-col items-center justify-center py-12"
          >
            <span class="material-symbols-outlined text-6xl text-red-500">error</span>
            <p class="mt-4 text-slate-600 dark:text-slate-400">{{ errorMessage }}</p>
            <button
              class="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              @click="handleRetry"
            >
              重试
            </button>
          </div>

          <div
            v-else-if="paymentStatus === 'pending'"
            class="flex flex-col items-center"
          >
            <div class="bg-white p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <img
                v-if="qrCodeUrl"
                :src="`${appEnv.qrCodeServiceBaseUrl}?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`"
                alt="支付二维码"
                class="w-48 h-48"
              />
              <div v-else class="w-48 h-48 flex items-center justify-center">
                <span class="material-symbols-outlined text-6xl text-slate-300 animate-pulse">qr_code</span>
              </div>
            </div>
            <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">
              请使用微信扫一扫<br>扫描上方二维码完成支付
            </p>
          </div>

          <div
            v-else-if="paymentStatus === 'paid'"
            class="flex flex-col items-center justify-center py-12"
          >
            <span class="material-symbols-outlined text-6xl text-green-500">check_circle</span>
            <p class="mt-4 text-lg font-bold text-green-600">支付成功！</p>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">积分即将到账，请稍候...</p>
          </div>

          <div
            v-else-if="paymentStatus === 'expired' || paymentStatus === 'closed'"
            class="flex flex-col items-center justify-center py-12"
          >
            <span class="material-symbols-outlined text-6xl text-amber-500">hourglass_empty</span>
            <p class="mt-4 text-slate-600 dark:text-slate-400">
              {{ paymentStatus === 'expired' ? '二维码已过期' : '支付已关闭' }}
            </p>
            <button
              class="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              @click="handleRetry"
            >
              重新发起支付
            </button>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span class="material-symbols-outlined text-sm">security</span>
            <span>支付安全由微信支付提供保障</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
