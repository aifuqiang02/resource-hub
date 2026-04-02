<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { HttpError } from "@/services/http/create-http-client";
import { getUserDashboard } from "@/services/modules/users";
import { useAuthStore } from "@/stores/auth";

defineOptions({
  name: "UserOverviewView",
});

const authStore = useAuthStore();
const isLoading = ref(false);
const pageError = ref("");
const dashboard = ref<Awaited<ReturnType<typeof getUserDashboard>> | null>(null);

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(value))
    : "-";

const joinedAtText = computed(() => {
  if (!dashboard.value) {
    return "加入日期：-";
  }

  return `加入日期：${formatDate(dashboard.value.profile.joinedAt)}`;
});

const transactionLabelMap: Record<string, string> = {
  RECHARGE: "积分充值",
  SPEND: "资源获取",
  REFUND: "积分退款",
};

const resourceStatusLabelMap: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
  OFFLINE: "已下线",
};

const loadDashboard = async () => {
  isLoading.value = true;
  pageError.value = "";

  try {
    const data = await getUserDashboard();
    dashboard.value = data;
    authStore.patchProfile({
      pointsBalance: data.profile.pointsBalance,
      avatar: data.profile.avatarUrl || undefined,
      name: data.profile.name,
    });
  } catch (error) {
    pageError.value =
      error instanceof HttpError ? error.message : "个人中心数据加载失败，请稍后重试";
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadDashboard();
});
</script>

<template>
  <div class="space-y-8">
    <div
      v-if="pageError"
      class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
    >
      {{ pageError }}
    </div>

    <!-- Account Profile & Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- User Info Card -->
      <div
        class="md:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-6"
      >
        <div class="relative">
          <div class="w-24 h-24 rounded-full border-4 border-primary/10 overflow-hidden">
            <img
              v-if="authStore.profile?.avatar"
              :src="authStore.profile.avatar"
              alt="Profile"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-primary/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-4xl text-primary">person</span>
            </div>
          </div>
          <button
            class="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full border-2 border-white dark:border-slate-900 shadow-lg"
          >
            <span class="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ authStore.profile?.name || "微信用户" }}
            </h1>
            <span
              class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase"
              >VIP</span
            >
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">{{ joinedAtText }} · 会员</p>
          <div class="flex gap-4">
            <div class="text-center px-4 border-r border-slate-100 dark:border-slate-800">
              <p class="text-xs text-slate-400 mb-1">总下载</p>
              <p class="font-bold text-lg">{{ dashboard?.stats.totalDownloads ?? 0 }}</p>
            </div>
            <div class="text-center px-4">
              <p class="text-xs text-slate-400 mb-1">已上传</p>
              <p class="font-bold text-lg">{{ dashboard?.stats.totalUploads ?? 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Points Widget -->
      <div
        class="bg-primary rounded-xl p-6 text-white flex flex-col justify-between shadow-xl shadow-primary/20 relative overflow-hidden group"
      >
        <div
          class="absolute -right-4 -top-4 text-white/10 group-hover:scale-110 transition-transform duration-500"
        >
          <span class="material-symbols-outlined text-8xl">monetization_on</span>
        </div>
        <div class="relative z-10">
          <p class="text-blue-200 text-sm font-medium mb-1">当前账户余额</p>
          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-bold tracking-tight">{{
              authStore.profile?.pointsBalance ?? 0
            }}</span>
            <span class="text-sm font-medium">积分</span>
          </div>
          <RouterLink
            to="/user/points"
            class="inline-block mt-2 text-xs text-blue-200 hover:text-white transition-colors"
          >
            收支明细 &gt;
          </RouterLink>
        </div>
        <RouterLink
          to="/user/recharge"
          class="relative z-10 mt-4 w-full py-2.5 bg-white text-primary rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm text-center"
        >
          立即充值积分
        </RouterLink>
      </div>
    </div>

    <!-- Recent Activity & Records -->
    <div class="grid grid-cols-1 gap-8">
      <!-- My Uploads - Management -->
      <div
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[310px]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
        >
          <h3 class="font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">publish</span>
            我上传的资源
          </h3>
          <div class="flex items-center gap-2">
            <RouterLink
              to="/user/publish"
              class="px-4 py-1.5 bg-primary text-white text-sm rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span class="material-symbols-outlined text-sm">add</span>
              发布资源
            </RouterLink>
            <RouterLink
              to="/user/resources"
              class="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-lg font-medium flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              查看全部
            </RouterLink>
          </div>
        </div>
        <div
          v-if="!dashboard || dashboard.recentUploads.length === 0"
          class="p-6 text-center text-slate-400"
        >
          <span class="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
          <p class="text-sm">暂无上传记录</p>
        </div>
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <div
            v-for="item in dashboard.recentUploads.slice(0, 3)"
            :key="item.id"
            class="flex items-center justify-between px-6 py-4"
          >
            <div>
              <p class="font-medium text-slate-900 dark:text-white">{{ item.title }}</p>
              <p class="text-xs text-slate-400">上传时间：{{ formatDate(item.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-400 mb-1">下载数：{{ item.downloadCount }}</p>
              <span class="text-xs font-semibold text-primary">{{ resourceStatusLabelMap[item.status] || item.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
