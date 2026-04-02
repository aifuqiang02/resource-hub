<script setup lang="ts">
import { ElButton, ElResult } from 'element-plus'
import DefaultLayout from '@/layouts/default-layout.vue'

defineOptions({
  name: 'ForbiddenView',
})
</script>

<template>
  <DefaultLayout title="无权限访问" description="当前账号没有访问这个后台页面的权限。">
    <section class="rounded-4xl border border-white/10 bg-white p-6 text-ink shadow-panel">
      <el-result icon="warning" title="没有权限" sub-title="请切换到管理员账号，或联系系统管理员分配权限。">
        <template #extra>
          <el-button type="primary" @click="$router.push('/dashboard')">回到工作台</el-button>
        </template>
      </el-result>
    </section>
  </DefaultLayout>
</template>
