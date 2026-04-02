<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'AIUploadView',
})

const skills = ref([
  {
    id: '1',
    name: 'Resource Analysis Skill',
    version: 'v1.2.4',
    description: '智能识别资源类型、编码格式及内容深度，自动分类。支持 50+ 种主流媒体与文档格式。',
    icon: 'analytics',
  },
  {
    id: '2',
    name: 'Auto-Metadata Generator',
    version: 'v2.0.1',
    description: '自动生成标题、标签及 SEO 描述。通过 OCR 和 NLP 技术提取文件内的核心关键词。',
    icon: 'label_important',
  },
])
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display">
    <!-- Header -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-40 py-3 sticky top-0 z-50">
      <div class="flex items-center gap-8">
        <RouterLink to="/" class="flex items-center gap-3 text-primary">
          <div class="size-8 flex items-center justify-center bg-primary/10 rounded-lg">
            <span class="material-symbols-outlined text-primary">auto_awesome</span>
          </div>
          <h2 class="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">臻享资源</h2>
        </RouterLink>
        <nav class="hidden md:flex items-center gap-8">
          <a class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">首页</a>
          <a class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">资源库</a>
          <a class="text-primary text-sm font-semibold transition-colors" href="#">AI 工具</a>
          <a class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" href="#">关于我们</a>
        </nav>
      </div>
      <div class="flex flex-1 justify-end gap-6 items-center">
        <div class="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
          <div class="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-primary/50 overflow-hidden">
            <div class="text-slate-500 flex items-center justify-center pl-3">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input class="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 px-3 text-sm font-normal placeholder:text-slate-400" placeholder="搜索 AI 插件..." type="text">
          </div>
        </div>
        <RouterLink to="/user" class="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <span class="material-symbols-outlined">person</span>
        </RouterLink>
      </div>
    </header>

    <main class="flex-1 flex flex-col items-center">
      <div class="layout-content-container flex flex-col max-w-[1024px] w-full px-6 lg:px-10 py-8">
        <!-- Tab Navigation -->
        <div class="mb-8">
          <div class="flex border-b border-slate-200 dark:border-slate-800 gap-8">
            <a class="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-3 hover:text-slate-700 dark:hover:text-slate-200" href="#">
              <span class="text-sm font-bold tracking-wide">手动上传</span>
            </a>
            <a class="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3" href="#">
              <span class="text-sm font-bold tracking-wide">AI 协同上传</span>
            </a>
          </div>
        </div>

        <!-- Section 1: Intro -->
        <div class="mb-12 bg-primary/5 dark:bg-primary/10 rounded-xl p-8 border border-primary/10">
          <div class="flex flex-col md:flex-row gap-8 items-center">
            <div class="flex-1">
              <h1 class="text-slate-900 dark:text-slate-100 text-3xl font-extrabold leading-tight mb-4">AI 协同上传</h1>
              <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                基于尖端 <span class="text-primary font-semibold">AI Skill</span> 技术，通过本地客户端自动提取资源元数据。实现海量资源一键同步，让资源分享更高效、更智能、更精准。
              </p>
              <div class="mt-6 flex gap-4">
                <button class="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                  <span class="material-symbols-outlined text-[18px]">download</span>
                  下载核心客户端
                </button>
                <button class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  查看技术文档
                </button>
              </div>
            </div>
            <div class="hidden md:block w-64 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20 relative overflow-hidden">
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="material-symbols-outlined text-primary text-[80px] opacity-40">hub</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Core Components -->
        <div class="mb-16">
          <div class="flex items-end justify-between mb-6">
            <div>
              <h2 class="text-slate-900 dark:text-slate-100 text-2xl font-bold">Skill 核心内容</h2>
              <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">根据您的需求选择并安装特定的 AI 识别能力</p>
            </div>
            <a class="text-primary text-sm font-medium hover:underline flex items-center gap-1" href="#">
              查看全部组件
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
          <div class="flex flex-col gap-4">
            <div v-for="(skill, idx) in skills" :key="skill.id" class="flex flex-col md:flex-row items-start md:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-lg transition-all group gap-6">
              <div class="flex items-center gap-4 flex-1">
                <div class="text-2xl font-black text-primary/20 group-hover:text-primary/40 transition-colors w-8">{{ idx + 1 }}.</div>
                <div class="size-12 bg-primary/10 rounded-xl flex-shrink-0 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <span class="material-symbols-outlined text-[28px]">{{ skill.icon }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-slate-900 dark:text-slate-100 text-lg font-bold">{{ skill.name }}</h3>
                    <span class="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">{{ skill.version }}</span>
                  </div>
                  <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{{ skill.description }}</p>
                </div>
              </div>
              <button class="w-full md:w-auto px-6 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[18px]">cloud_download</span>
                安装此组件
              </button>
            </div>
          </div>
        </div>

        <!-- Section 3: How to Use -->
        <div class="mb-12">
          <h2 class="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-8">如何使用 AI 协同</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <!-- Step 1 -->
            <div class="flex flex-col items-center text-center">
              <div class="size-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-primary/30 z-10">1</div>
              <h4 class="text-slate-900 dark:text-slate-100 font-bold mb-2">下载并安装</h4>
              <p class="text-slate-500 dark:text-slate-400 text-sm">下载 AI Skill 桌面端，并完成核心组件的本地安装。</p>
            </div>
            <!-- Step 2 -->
            <div class="flex flex-col items-center text-center">
              <div class="size-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-primary/30 z-10">2</div>
              <h4 class="text-slate-900 dark:text-slate-100 font-bold mb-2">配置本地路径</h4>
              <p class="text-slate-500 dark:text-slate-400 text-sm">在客户端中选择您需要监控的本地文件夹或资源库路径。</p>
            </div>
            <!-- Step 3 -->
            <div class="flex flex-col items-center text-center">
              <div class="size-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-primary/30 z-10">3</div>
              <h4 class="text-slate-900 dark:text-slate-100 font-bold mb-2">自动同步</h4>
              <p class="text-slate-500 dark:text-slate-400 text-sm">AI 会自动扫描、提取元数据，并保持线上线下资源实时同步。</p>
            </div>
            <!-- Connecting Line -->
            <div class="hidden md:block absolute top-7 left-[15%] right-[15%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 lg:px-40 py-10 mt-auto">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined text-[20px]">auto_awesome</span>
            <span class="font-bold">臻享资源</span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs">© 2024 臻享资源. 版权所有.</p>
        </div>
        <div class="flex gap-8">
          <a class="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" href="#">服务条款</a>
          <a class="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" href="#">隐私政策</a>
          <a class="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" href="#">开发者 API</a>
        </div>
        <div class="flex gap-4">
          <div class="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary cursor-pointer transition-all">
            <span class="material-symbols-outlined text-[18px]">language</span>
          </div>
          <div class="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary cursor-pointer transition-all">
            <span class="material-symbols-outlined text-[18px]">share</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
