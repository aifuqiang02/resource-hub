<script setup lang="ts">
import { ElButton, ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus'
import DefaultLayout from '@/layouts/default-layout.vue'
import { useAuthStore } from '@/stores/auth'

defineOptions({
  name: 'DashboardView',
})

const authStore = useAuthStore()

const handleSignOut = () => {
  authStore.signOut()
}
</script>

<template>
  <DefaultLayout title="运营工作台" description="桌面端模板更适合承载图表、表格、筛选和多列信息布局。">
    <section class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <article class="rounded-4xl border border-white/10 bg-white p-6 text-ink shadow-panel">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">账号信息</h2>
            <p class="mt-2 text-sm text-slate-500">当前登录用户和角色信息。</p>
          </div>
          <el-tag type="success">{{ authStore.roles.join(', ') || 'guest' }}</el-tag>
        </div>

        <el-descriptions class="mt-6" :column="1" border>
          <el-descriptions-item label="姓名">{{ authStore.profile?.name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ authStore.profile?.email }}</el-descriptions-item>
          <el-descriptions-item label="管理员权限">
            {{ authStore.hasAnyRole(['admin']) ? '是' : '否' }}
          </el-descriptions-item>
        </el-descriptions>
      </article>

      <article class="rounded-4xl border border-white/10 bg-white p-6 text-ink shadow-panel">
        <h2 class="text-xl font-semibold">快捷操作</h2>
        <div class="mt-6 grid gap-3">
          <el-button type="primary" @click="$router.push('/admin')">进入管理页</el-button>
          <el-button v-permission="['admin']" type="success" plain>仅管理员可见按钮</el-button>
          <el-button plain @click="handleSignOut">退出登录</el-button>
        </div>
      </article>
    </section>
  </DefaultLayout>
</template>
