<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import UserSidebar from "@/components/user/user-sidebar.vue";

defineOptions({
  name: "UserLayout",
});

const route = useRoute();
const activePath = computed(() => route.path);
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar -->
      <aside class="w-full lg:w-64 shrink-0">
        <UserSidebar :active-path="activePath" />
      </aside>

      <!-- Content Area -->
      <div class="flex-1 min-w-0">
        <RouterView />
      </div>
    </div>
  </main>
</template>
