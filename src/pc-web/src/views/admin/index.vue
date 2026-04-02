<script setup lang="ts">
import { ElButton, ElResult } from 'element-plus'
import DefaultLayout from '@/layouts/default-layout.vue'

defineOptions({
  name: 'AdminView',
})
</script>

<template>
  <DefaultLayout title="管理员控制台" description="这个页面可以继续扩展表格、树、筛选表单和权限管理。">
    <section class="rounded-4xl border border-white/10 bg-white p-6 text-ink shadow-panel">
      <el-result icon="success" title="管理员权限已生效" sub-title="当前账号具备访问后台控制能力。">
        <template #extra>
          <el-button type="primary" @click="$router.push('/dashboard')">返回工作台</el-button>
        </template>
      </el-result>
    </section>
  </DefaultLayout>
</template>
