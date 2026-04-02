<script setup lang="ts">
defineProps<{
  loading?: boolean
  title: string
  description: string
}>()
</script>

<template>
  <div class="page-state">
    <div class="page-state__card">
      <div v-if="loading" class="page-state__spinner" aria-hidden="true" />
      <h2 class="page-state__title">{{ title }}</h2>
      <p class="page-state__description">{{ description }}</p>
      <slot />
    </div>
  </div>
</template>
