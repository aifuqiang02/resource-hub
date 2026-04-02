<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'
import { appEnv } from '@/config/env'
import { useAuthStore } from '@/stores/auth'
import { weChatLogin } from '@/services/modules/auth'

defineOptions({
  name: 'LoginView',
})

const router = useRouter()
const authStore = useAuthStore()
const agreementChecked = ref(true)

const wechatApiBase = `${appEnv.openPlatformBaseUrl}/api/v1/apps/${appEnv.openPlatformAppId}/wechat-login`

const loginState = ref<'idle' | 'loading' | 'scanning' | 'success' | 'expired' | 'error'>('idle')
const qrCodeUrl = ref('')
const bizId = ref('')
const errorMsg = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

const generateBizId = () => {
  return `biz_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

const generateQRCodeUrl = (data: string) => {
  return `${appEnv.qrCodeServiceBaseUrl}?size=256x256&margin=8&data=${encodeURIComponent(data)}`
}

const startLogin = async () => {
  loginState.value = 'loading'
  errorMsg.value = ''
  bizId.value = generateBizId()

  try {
    const res = await axios.post(`${wechatApiBase}/sessions`, {
      bizId: bizId.value,
    })

    if (res.data.code === 200 && res.data.data.qrCodeUrl) {
      qrCodeUrl.value = generateQRCodeUrl(res.data.data.qrCodeUrl)
      loginState.value = 'scanning'
      startPolling()
    } else {
      throw new Error(res.data.msg || '获取二维码失败')
    }
  } catch (err: unknown) {
    loginState.value = 'error'
    errorMsg.value = err instanceof Error ? err.message : '网络错误，请重试'
  }
}

const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer)

  pollTimer = setInterval(async () => {
    try {
      const res = await axios.get(`${wechatApiBase}/sessions/by-biz/${bizId.value}`)

      if (res.data.code === 200) {
        const status = res.data.data.status

        if (status === 'success') {
          stopPolling()
          handleLoginSuccess(res.data.data)
        } else if (status === 'expired') {
          stopPolling()
          loginState.value = 'expired'
        }
      }
    } catch {
      // ignore polling errors, will retry
    }
  }, 2500)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

interface WeChatProfile {
  openId: string
  unionId: string
  nickname: string
  avatarUrl: string
  authorizedAt: string
}

interface WeChatLoginData {
  sessionId: string
  bizId: string
  status: string
  expiresAt: string
  profile: WeChatProfile | null
}

const handleLoginSuccess = async (data: WeChatLoginData) => {
  const profile = data.profile

  if (!profile) {
    errorMsg.value = '获取用户信息失败'
    loginState.value = 'error'
    return
  }

  console.log('微信登录成功:', {
    openId: profile.openId,
    unionId: profile.unionId,
    nickname: profile.nickname,
    avatarUrl: profile.avatarUrl,
  })

  // 调用后端登录接口
  try {
    const loginRes = await weChatLogin({
      openId: profile.openId,
      unionId: profile.unionId,
      nickname: profile.nickname,
      avatarUrl: profile.avatarUrl,
    })

    authStore.setSession(loginRes)
    loginState.value = 'success'
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : '后端登录失败'
    loginState.value = 'error'
  }
}

const refreshQRCode = () => {
  startLogin()
}

onMounted(() => {
  startLogin()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display">
    <!-- Left Side: Branding & Culture -->
    <div class="hidden md:flex md:w-5/12 lg:w-1/2 relative flex-col justify-center items-center px-12 lg:px-24 bg-primary text-white overflow-hidden">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div class="relative z-10 w-full max-w-lg">
        <div class="mb-8 flex items-center gap-3">
          <div class="bg-white p-2 rounded-xl">
            <span class="material-symbols-outlined text-primary text-3xl font-bold">diamond</span>
          </div>
          <h1 class="text-4xl font-bold tracking-tight">臻享资源</h1>
        </div>
        <h2 class="text-2xl lg:text-3xl font-bold leading-tight mb-6">助力用户发现优质软件与AI资源</h2>
        <div class="space-y-8">
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-white">rocket_launch</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">我们的使命</h3>
              <p class="text-white/80 leading-relaxed">连接高效工具，赋能数字生活。致力于为每一位创造者寻找最顶尖的生产力工具。</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-white">verified</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">核心价值观</h3>
              <p class="text-white/80 leading-relaxed">品质、效率、创新。我们坚持严格筛选，只为呈现最高价值的资源内容。</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-white">lightbulb</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">我们的初衷</h3>
              <p class="text-white/80 leading-relaxed">快速找到可用的资源</p>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-10 left-12 lg:left-24">
        <p class="text-white/60 text-sm">© 2024 臻享资源. All rights reserved.</p>
      </div>
    </div>

    <!-- Right Side: QR Login -->
    <div class="flex-1 flex flex-col justify-center items-center bg-background-light dark:bg-background-dark px-6">
      <div class="w-full max-w-md bg-white dark:bg-slate-900/50 p-10 rounded-2xl shadow-xl shadow-primary/5 border border-slate-200 dark:border-slate-800 text-center">
        <!-- Mobile Logo (Visible only on small screens) -->
        <div class="md:hidden mb-8 flex flex-col items-center">
          <div class="bg-primary p-3 rounded-2xl mb-4">
            <span class="material-symbols-outlined text-white text-3xl font-bold">diamond</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">臻享资源</h1>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">微信扫码登录/注册</h2>
          <p class="text-slate-500 dark:text-slate-400">请使用微信扫一扫安全登录</p>
        </div>

        <!-- QR Code Container -->
        <div class="relative group cursor-pointer" @click="refreshQRCode">
          <!-- Loading State -->
          <div v-if="loginState === 'loading'" class="mx-auto w-64 h-64 bg-white p-4 rounded-xl border-2 border-primary/50 flex flex-col items-center justify-center gap-4">
            <span class="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
            <p class="text-sm text-slate-500">正在生成二维码...</p>
          </div>

          <!-- Scanning State: Show QR Code -->
          <div v-else-if="loginState === 'scanning'" class="mx-auto w-64 h-64 bg-white p-4 rounded-xl border-2 border-primary/50 flex items-center justify-center transition-all duration-300 group-hover:border-primary">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="请使用微信扫码" class="w-full h-full object-contain">
            <div class="absolute bottom-2 right-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              点击刷新
            </div>
          </div>

          <!-- Success State -->
          <div v-else-if="loginState === 'success'" class="mx-auto w-64 h-64 bg-green-50 p-4 rounded-xl border-2 border-green-500/50 flex flex-col items-center justify-center gap-3">
            <span class="material-symbols-outlined text-6xl text-green-500">check_circle</span>
            <p class="text-sm text-green-600 font-medium">登录成功</p>
            <p class="text-xs text-green-500">正在跳转...</p>
          </div>

          <!-- Expired State -->
          <div v-else-if="loginState === 'expired'" class="mx-auto w-64 h-64 bg-white p-4 rounded-xl border-2 border-orange-500/50 flex flex-col items-center justify-center gap-3">
            <span class="material-symbols-outlined text-6xl text-orange-500">timer_off</span>
            <p class="text-sm text-orange-600 font-medium">二维码已过期</p>
            <button class="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors" @click.stop="refreshQRCode">
              重新获取
            </button>
          </div>

          <!-- Error State -->
          <div v-else-if="loginState === 'error'" class="mx-auto w-64 h-64 bg-white p-4 rounded-xl border-2 border-red-500/50 flex flex-col items-center justify-center gap-3">
            <span class="material-symbols-outlined text-6xl text-red-500">error</span>
            <p class="text-sm text-red-600 font-medium">{{ errorMsg }}</p>
            <button class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors" @click.stop="refreshQRCode">
              重试
            </button>
          </div>
        </div>

        <div class="mt-8 flex items-center justify-center gap-2 py-3 px-6 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-sm">
          <input v-model="agreementChecked" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" id="agreement" type="checkbox">
          <label class="cursor-pointer select-none" for="agreement">我已阅读并同意 <RouterLink class="text-primary hover:underline font-medium" to="/agreement">用户协议</RouterLink> 与 <RouterLink class="text-primary hover:underline font-medium" to="/privacy">隐私政策</RouterLink></label>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <a class="hover:text-primary transition-colors" href="#">帮助中心</a>
          <a class="hover:text-primary transition-colors" href="#">联系我们</a>
        </div>
      </div>

      <!-- Footer for mobile only -->
      <div class="md:hidden mt-8 text-slate-400 text-xs text-center">
        <p>© 2024 臻享资源. 连接高效工具，赋能数字生活.</p>
      </div>
    </div>
  </div>
</template>
