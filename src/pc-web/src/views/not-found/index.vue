<script setup lang="ts">
import { ElButton, ElResult } from 'element-plus'
import DefaultLayout from '@/layouts/default-layout.vue'

defineOptions({
  name: 'NotFoundView',
})
</script>

<template>
  <DefaultLayout title="页面不存在" description="这个地址没有对应的后台页面。">
    <section class="rounded-4xl border border-white/10 bg-white p-6 text-ink shadow-panel">
      <el-result icon="info" title="404" sub-title="请检查地址是否正确，或返回首页继续浏览。">
        <template #extra>
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </template>
      </el-result>
    </section>
  </DefaultLayout>
</template>
