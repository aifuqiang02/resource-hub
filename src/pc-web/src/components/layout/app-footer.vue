<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'AppFooter',
})
</script>

<template>
  <footer class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4 mt-12">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
      <div class="max-w-sm">
        <div class="flex items-center gap-2 mb-4">
          <img src="/logo.png" alt="Logo" class="h-6 w-auto">
          <h3 class="text-lg font-bold">臻享资源</h3>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed">
          我们致力于为创意工作者、开发者和职场新人提供最高质量的数字资源。
          所有资源经过人工审核，确保安全可靠。
        </p>
      </div>
      <div class="flex flex-col md:flex-row gap-8">
        <div>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">快速链接</h4>
          <nav class="flex flex-col gap-2">
            <RouterLink to="/" class="text-sm text-slate-500 hover:text-primary transition-colors">资源</RouterLink>
            <RouterLink to="/about" class="text-sm text-slate-500 hover:text-primary transition-colors">关于我们</RouterLink>
          </nav>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">法律信息</h4>
          <nav class="flex flex-col gap-2">
            <RouterLink to="/agreement" class="text-sm text-slate-500 hover:text-primary transition-colors">用户协议</RouterLink>
            <a href="mailto:support@example.com" class="text-sm text-slate-500 hover:text-primary transition-colors">联系我们</a>
          </nav>
        </div>
      </div>
    </div>
    <div class="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
      © 2024 臻享资源 Premium Resources. All rights reserved.
    </div>
  </footer>
</template>
