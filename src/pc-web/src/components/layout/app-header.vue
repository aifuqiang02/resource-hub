<script setup lang="ts">
import { ref, computed, useSlots } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

defineOptions({
  name: "AppHeader",
});

withDefaults(
  defineProps<{
    showNav?: boolean;
    showUser?: boolean;
    showLogin?: boolean;
  }>(),
  {
    showNav: true,
    showUser: true,
    showLogin: false,
  },
);

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const slots = useSlots();
const showDropdown = ref(false);

const isUserPage = computed(() => route.path.startsWith("/user"));
const isHomePage = computed(() => route.path === "/");
const isAboutPage = computed(() => route.path === "/about");
const hasCustomNav = computed(() => Boolean(slots.nav));

const getNavClass = (active: boolean) =>
  active
    ? "text-sm font-semibold text-primary"
    : "text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors";

const handleLogout = () => {
  authStore.signOut();
  router.push("/login");
};
</script>

<template>
  <header class="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2">
        <img src="/logo.png" alt="Logo" class="h-8 w-auto" />
        <h1 class="text-xl font-bold tracking-tight">臻享资源</h1>
      </RouterLink>
      <nav v-if="showNav" class="hidden md:flex items-center gap-8">
        <template v-if="hasCustomNav">
          <slot name="nav" />
        </template>
        <template v-else>
          <RouterLink to="/" :class="getNavClass(isHomePage)">首页</RouterLink>
          <RouterLink to="/about" :class="getNavClass(isAboutPage)">关于我们</RouterLink>
          <RouterLink to="/user" :class="getNavClass(isUserPage)">个人中心</RouterLink>
        </template>
      </nav>
      <div class="flex items-center gap-4">
        <slot name="actions" />
        <RouterLink
          to="/user/notifications"
          class="flex items-center justify-center size-9 text-slate-600 dark:text-slate-400 hover:text-primary"
        >
          <span class="material-symbols-outlined">notifications</span>
        </RouterLink>
        <template v-if="showLogin && !authStore.isAuthenticated">
          <RouterLink
            to="/login"
            class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            登录
          </RouterLink>
        </template>
        <template v-else-if="showUser && authStore.isAuthenticated">
          <!-- User Dropdown -->
          <div
            class="relative"
            @mouseenter="showDropdown = true"
            @mouseleave="showDropdown = false"
          >
            <button
              class="flex items-center justify-center size-9 rounded-full bg-primary/10 border border-primary/20 overflow-hidden"
            >
              <img
                v-if="authStore.profile?.avatar"
                :src="authStore.profile.avatar"
                class="w-full h-full object-cover"
              />
              <span v-else class="material-symbols-outlined text-primary">person</span>
            </button>
            <!-- Dropdown Menu -->
            <div
              v-if="showDropdown"
              class="absolute right-0 top-full -mt-px w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {{ authStore.profile?.name || "用户" }}
                </p>
                <p class="text-xs text-slate-500 truncate">
                  {{ authStore.profile?.email || "微信用户" }}
                </p>
              </div>
              <RouterLink
                v-if="!isUserPage"
                to="/user"
                class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span class="material-symbols-outlined text-lg">manage_accounts</span>
                个人中心
              </RouterLink>
              <button
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                @click="handleLogout"
              >
                <span class="material-symbols-outlined text-lg">logout</span>
                退出登录
              </button>
            </div>
          </div>
        </template>
        <template v-else-if="showUser">
          <RouterLink
            to="/login"
            class="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20"
          >
            <span class="material-symbols-outlined">person</span>
          </RouterLink>
        </template>
      </div>
    </div>
  </header>
</template>
