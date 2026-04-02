<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import PaymentModal from '@/components/recharge/payment-modal.vue'

defineOptions({
  name: 'PointsRechargeView',
})

const authStore = useAuthStore()

const packages = ref([
  { points: 10, price: 1 },
  { points: 50, price: 5 },
  { points: 100, price: 10, tag: '最实惠' },
  { points: 200, price: 20, tag: '人气最高' },
])

const selectedPackage = ref(2)
const showPaymentModal = ref(false)
const successMessage = ref('')

const selectedPkg = computed(() => packages.value[selectedPackage.value])

function handlePay() {
  showPaymentModal.value = true
}

function handlePaymentSuccess(payload: { bizId: string; points: number; amount: number; paidAt: string | null }) {
  const currentBalance = authStore.profile?.pointsBalance ?? 0

  authStore.patchProfile({
    pointsBalance: currentBalance + payload.points,
  })

  successMessage.value = `充值成功，已到账 ${payload.points} 积分。`
}

function handlePaymentClose() {
  showPaymentModal.value = false
}
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col gap-6">
      <div
        v-if="successMessage"
        class="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700"
      >
        <span class="material-symbols-outlined">check_circle</span>
        <span class="text-sm font-medium">{{ successMessage }}</span>
      </div>

      <section class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 flex flex-col gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
              <img v-if="authStore.profile?.avatar" :src="authStore.profile.avatar" class="w-full h-full object-cover" />
              <span v-else class="material-symbols-outlined text-2xl">person</span>
            </div>
            <div class="flex flex-col">
              <h1 class="text-slate-900 dark:text-slate-100 text-base font-semibold">当前账户：{{ authStore.profile?.name || '微信用户' }}</h1>
              <p class="text-slate-500 dark:text-slate-400 text-sm">普通会员</p>
            </div>
          </div>
        </div>
        <div class="flex-1 flex flex-col gap-2 rounded-xl p-6 bg-primary text-white shadow-lg shadow-primary/20">
          <p class="text-white/80 text-sm font-medium">当前余额</p>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-bold tracking-tight">{{ authStore.profile?.pointsBalance ?? 0 }}</span>
            <span class="text-sm font-medium">积分</span>
          </div>
        </div>
      </section>

      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 class="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4">选择充值套餐</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            v-for="(pkg, idx) in packages"
            :key="pkg.points"
            :class="['flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors relative', selectedPackage === idx ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-primary/50 bg-slate-50 dark:bg-slate-800/50']"
            @click="selectedPackage = idx"
          >
            <div v-if="pkg.tag" class="absolute -top-3" style="left: 50%; transform: translateX(-50%)">
              <span class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{{ pkg.tag }}</span>
            </div>
            <span class="text-slate-900 dark:text-slate-100 text-lg font-bold">{{ pkg.points }} 积分</span>
            <span class="text-primary font-medium">¥{{ pkg.price }}</span>
          </button>
        </div>
      </section>

      <section class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 class="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4">支付方式</h3>
        <div class="flex items-center justify-between p-4 rounded-lg border-2 border-primary bg-primary/5">
          <div class="flex items-center gap-3">
            <div class="size-8 bg-[#07C160] rounded flex items-center justify-center text-white">
              <svg fill="currentColor" height="20" viewbox="0 0 24 24" width="20">
                <path d="M12,2C6.47,2,2,5.7,2,10.25c0,2.6,1.45,4.91,3.71,6.34L4.85,19.2c-0.12,0.3,0.02,0.64,0.32,0.76 c0.09,0.03,0.18,0.05,0.27,0.05c0.21,0,0.41-0.11,0.51-0.31l1.58-2.98C8.52,17.2,9.73,17.43,11,17.48c0.33,0.01,0.67,0.02,1,0.02 c5.53,0,10-3.7,10-8.25S17.53,2,12,2z"></path>
              </svg>
            </div>
            <span class="text-slate-900 dark:text-slate-100 font-semibold">微信支付</span>
          </div>
          <span class="material-symbols-outlined text-primary">check_circle</span>
        </div>
      </section>

      <div class="flex flex-col gap-4">
        <button
          class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          @click="handlePay"
        >
          立即支付 ¥{{ selectedPkg?.price || 0 }}.00
        </button>
        <div class="p-6 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2 mb-3 text-slate-900 dark:text-slate-100 font-semibold">
            <span class="material-symbols-outlined text-sm">info</span>
            <span>充值说明</span>
          </div>
          <ul class="text-sm text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4">
            <li>充值比例：人民币与积分比例为 1:10 (1元 = 10积分)。</li>
            <li>虚拟商品：积分属于虚拟商品，充值成功后不支持退款，请确认后购买。</li>
            <li>到账时间：支付完成后积分通常实时到账，如遇延迟请联系在线客服。</li>
            <li>合法合规：请勿通过非法手段获取积分，违者将被封禁账号且不予退还余额。</li>
          </ul>
        </div>
      </div>
    </div>

    <PaymentModal
      :show="showPaymentModal"
      :points="selectedPkg?.points || 0"
      :price="selectedPkg?.price || 0"
      @close="handlePaymentClose"
      @success="handlePaymentSuccess"
    />
  </div>
</template>
