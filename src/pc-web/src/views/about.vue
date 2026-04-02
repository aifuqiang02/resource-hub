<script setup lang="ts">
import { RouterLink } from "vue-router";

defineOptions({
  name: "AboutView",
});

const advantages = [
  {
    icon: "verified",
    title: "品质保证",
    description: "所有资源经过人工审核，确保安全可靠。",
  },
  {
    icon: "speed",
    title: "高效发现",
    description: "强大的搜索和分类体系，快速找到所需资源。",
  },
  {
    icon: "security",
    title: "安全可信",
    description: "资源全部经过安全检测，放心使用。",
  },
  {
    icon: "groups",
    title: "社区共建",
    description: "用户可以分享自己的优质资源，互惠互利。",
  },
];
</script>

<template>
  <div
    class="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100"
  >
    <main class="flex-grow">
      <!-- Hero Section -->
      <section class="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            关于臻享资源
          </h1>
          <p class="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            臻享资源致力于为创意工作者、开发者和职场新人提供最高质量的数字资源。
          </p>
        </div>
      </section>

      <!-- Advantages Section -->
      <section class="py-16 px-4">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            我们的优势
          </h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              v-for="item in advantages"
              :key="item.title"
              class="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 text-center"
            >
              <div
                class="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span class="material-symbols-outlined text-3xl text-primary">{{ item.icon }}</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {{ item.title }}
              </h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="py-16 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">联系我们</h2>
          <p class="text-slate-600 dark:text-slate-400 mb-8">
            如有问题或建议，请通过以下方式联系我们：
          </p>
          <div class="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span class="material-symbols-outlined">mail</span>
              <span>support@zhenxiang.com</span>
            </div>
            <img src="/qq.png" alt="QQ群二维码" class="w-48 rounded-lg border border-slate-200 dark:border-slate-700" />
          </div>
        </div>
      </section>
    </main>

    </div>
</template>
