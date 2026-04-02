<script setup lang="ts">
import AppHeader from "@/components/layout/app-header.vue";
import AppFooter from "@/components/layout/app-footer.vue";
</script>

<template>
  <div
    class="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100"
  >
    <AppHeader />
    <RouterView />
    <AppFooter />
  </div>
</template>
