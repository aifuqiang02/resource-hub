<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserSidebar from '@/components/user/user-sidebar.vue'
import NotificationDropdown from '@/components/notification/NotificationDropdown.vue'

defineOptions({
  name: 'UserLayout',
})

const route = useRoute()
const authStore = useAuthStore()
const activePath = computed(() => route.path)
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
    <!-- Top Navigation Bar -->
    <header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <RouterLink to="/" class="flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined text-3xl">deployed_code</span>
            <h2 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">臻享资源</h2>
          </RouterLink>
          <nav class="hidden md:flex items-center gap-6">
            <RouterLink to="/" class="text-sm font-medium hover:text-primary transition-colors">首页</RouterLink>
            <a class="text-sm font-medium hover:text-primary transition-colors text-primary" href="#">资源库</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="#">开发者社区</a>
          </nav>
        </div>
        <div class="flex items-center gap-4 flex-1 justify-end">
          <div class="relative max-w-sm w-full hidden sm:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input class="w-full pl-10 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all" placeholder="搜索组件、模版、文档..." type="text"/>
          </div>
          <NotificationDropdown />
          <RouterLink to="/user" class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
            <img v-if="authStore.profile?.avatar" :src="authStore.profile.avatar" :alt="authStore.profile.name" class="w-full h-full object-cover" />
            <span v-else class="material-symbols-outlined text-primary text-sm">person</span>
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar -->
        <aside class="w-full lg:w-64 shrink-0">
          <UserSidebar :active-path="activePath" />
        </aside>

        <!-- Content Area -->
        <div class="flex-1 min-w-0">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>
