<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-6 lg:px-8">
      <aside
        class="hidden w-72 shrink-0 rounded-4xl border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur lg:block"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-teal-300">Admin Starter</p>
        <h2 class="mt-4 text-2xl font-semibold text-white">{{ title }}</h2>
        <p class="mt-3 text-sm leading-7 text-slate-300">{{ description }}</p>
        <div class="mt-8 space-y-3 text-sm text-slate-300">
          <p>Element Plus 桌面组件</p>
          <p>Tailwind CSS 布局与设计 token</p>
          <p>鉴权、路由、请求层与测试链路</p>
        </div>
      </aside>

      <main class="flex-1 space-y-6">
        <header class="rounded-4xl border border-white/10 bg-white p-6 text-ink shadow-panel">
          <p class="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">Vite Vue3 Admin</p>
          <h1 class="mt-3 text-3xl font-semibold lg:text-5xl">{{ title }}</h1>
          <p v-if="description" class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 lg:text-base">
            {{ description }}
          </p>
        </header>

        <slot />
      </main>
    </div>
  </div>
</template>
