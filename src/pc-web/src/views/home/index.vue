<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { HttpError } from "@/services/http/create-http-client";
import { acquireResource } from "@/services/modules/downloads";
import { useAuthStore } from "@/stores/auth";
import { listPublicResources, type ResourceListItem } from "@/services/modules/resources";
import { listHotKeywords, recordSearch } from "@/services/modules/search";

defineOptions({
  name: "HomeView",
});

const authStore = useAuthStore();
const searchQuery = ref("");
const activeCategory = ref("");
const sortBy = ref<"latest" | "popular">("latest");
const freeOnly = ref(false);
const currentPage = ref(1);
const isLoading = ref(false);
const hasLoaded = ref(false);
const loadError = ref("");
const resources = ref<ResourceListItem[]>([]);
const total = ref(0);
const totalPages = ref(1);
const categories = ref<Array<{ id: string; name: string; slug: string; count: number }>>([]);
const openingId = ref("");
const hoveredResourceId = ref("");

const hotSearches = ref<string[]>([]);

const loadHotKeywords = async () => {
  try {
    hotSearches.value = await listHotKeywords(10);
  } catch {
    hotSearches.value = [];
  }
};

const onSearchBlur = () => {
  if (searchQuery.value.trim()) {
    recordSearch(searchQuery.value.trim()).catch(() => {});
  }
};



const summaryText = computed(() => `共 ${total.value} 条结果`);
const pageNumbers = computed(() => {
  const maxVisible = 5;
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + maxVisible - 1);
  const adjustedStart = Math.max(1, end - maxVisible + 1);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
});

const formatCategory = (resource: ResourceListItem) => resource.category?.name || "未分类";
const formatDescription = (resource: ResourceListItem) =>
  resource.description || resource.contentMd || "暂无详细说明";
const isFreeResource = (resource: ResourceListItem) => resource.pointsCost === 0;
const isOwnedResource = (resource: ResourceListItem) => Boolean(resource.owned);

const loadResources = async () => {
  isLoading.value = true;
  loadError.value = "";

  try {
    const response = await listPublicResources({
      page: currentPage.value,
      pageSize: 10,
      q: searchQuery.value.trim() || undefined,
      category: activeCategory.value || undefined,
      sort: sortBy.value,
      freeOnly: freeOnly.value,
    });
    resources.value = response.items;
    categories.value = response.categories;
    total.value = response.pagination.total;
    totalPages.value = response.pagination.totalPages;
  } catch (error) {
    loadError.value = error instanceof HttpError ? error.message : "首页资源加载失败，请稍后重试";
  } finally {
    isLoading.value = false;
    hasLoaded.value = true;
  }
};

watch(searchQuery, () => {
  window.clearTimeout((loadResources as typeof loadResources & { timer?: number }).timer);
  (loadResources as typeof loadResources & { timer?: number }).timer = window.setTimeout(() => {
    currentPage.value = 1;
    void loadResources();
  }, 250);
});

watch(activeCategory, async () => {
  currentPage.value = 1;
  await loadResources();
});

watch(sortBy, async () => {
  currentPage.value = 1;
  await loadResources();
});

watch(freeOnly, async () => {
  currentPage.value = 1;
  await loadResources();
});

watch(currentPage, async () => {
  await loadResources();
});

onMounted(async () => {
  await Promise.all([loadResources(), loadHotKeywords()]);
});

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }

  currentPage.value = page;
};

const handleCardAction = async (resource: ResourceListItem) => {
  if (!authStore.isAuthenticated || !resource.owned || !resource.shareLink) {
    return;
  }

  openingId.value = resource.id;

  try {
    const result = await acquireResource(resource.id);
    authStore.patchProfile({
      pointsBalance: result.currentPointsBalance,
    });
    window.open(result.shareLink, "_blank", "noopener,noreferrer");
  } catch (error) {
    window.alert(error instanceof HttpError ? error.message : "打开资源失败，请稍后重试");
  } finally {
    openingId.value = "";
  }
};
</script>

<template>
  <main class="flex-grow">
    <section class="pt-8 pb-8 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <span
              class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors"
              >search</span
            >
          </div>
          <input
            v-model="searchQuery"
            class="block w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border-none rounded-2xl shadow-xl shadow-primary/5 focus:ring-2 focus:ring-primary text-lg placeholder:text-slate-400"
            placeholder="搜索资源名称、标签、教程或工具..."
            type="text"
            @blur="onSearchBlur"
          />
        </div>
        <div v-if="hotSearches.length > 0" class="mt-6 flex flex-wrap justify-center gap-3">
          <span class="text-sm text-slate-500">热搜:</span>
          <button
            v-for="keyword in hotSearches"
            :key="keyword"
            class="text-sm text-primary hover:underline"
            @click="searchQuery = keyword"
          >
            {{ keyword }}
          </button>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4">
      <div
        class="max-w-6xl mx-auto bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-lg px-6 py-6 md:px-8 md:py-8"
      >
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex flex-wrap gap-3">
            <button
              :class="[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                activeCategory === ''
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
              ]"
              @click="activeCategory = ''"
            >
              全部分类
            </button>
            <button
              v-for="category in categories"
              :key="category.id"
              :class="[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                activeCategory === category.slug
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
              ]"
              @click="activeCategory = category.slug"
            >
              {{ category.name }} ({{ category.count }})
            </button>
            <button
              :class="[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                freeOnly
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
              ]"
              @click="freeOnly = !freeOnly"
            >
              仅看免费
            </button>
          </div>
          <select
            v-model="sortBy"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="latest">最新发布</option>
            <option value="popular">最热资源</option>
          </select>
        </div>
        <div
          class="flex items-center justify-between mb-10 pb-4 border-b border-slate-200 dark:border-slate-800"
        >
          <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100">精选资源报告</h3>
          <div class="flex items-center gap-3">
            <span v-if="isLoading && hasLoaded" class="text-xs text-primary">搜索中...</span>
            <span class="text-sm text-slate-500">{{ summaryText }}</span>
          </div>
        </div>

        <div
          v-if="loadError"
          class="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
        >
          {{ loadError }}
        </div>
        <div v-else-if="isLoading && !hasLoaded" class="py-16 text-center text-sm text-slate-500">
          正在加载资源...
        </div>
        <div v-else-if="!isLoading && resources.length === 0" class="py-16 text-center text-sm text-slate-500">
          暂无匹配资源
        </div>

        <a
          v-for="resource in resources"
          :key="resource.id"
          :href="`/software/${resource.id}`"
          target="_blank"
          class="block px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-lg transition-colors"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 group"
              @mouseenter="hoveredResourceId = resource.id"
              @mouseleave="hoveredResourceId = ''"
            >
              <img
                v-if="resource.screenshotUrl"
                :src="resource.screenshotUrl"
                :alt="resource.title"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <span class="material-symbols-outlined text-3xl text-primary">folder_open</span>
              </div>
              <div
                v-if="hoveredResourceId === resource.id && resource.screenshotUrl"
                class="fixed z-[9999] hidden group-hover:block"
                :style="{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }"
              >
                <img
                  :src="resource.screenshotUrl"
                  :alt="resource.title"
                  class="object-cover rounded-xl shadow-2xl border border-slate-200 bg-white"
                  @load="(e) => { const img = e.target as HTMLImageElement; if (img.naturalWidth > 1000 || img.naturalHeight > 1000) { img.style.maxWidth = '800px'; img.style.maxHeight = '800px'; } }"
                />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h4 class="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {{ resource.title }}
                </h4>
                <span
                  class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs rounded"
                  >{{ formatCategory(resource) }}</span
                >
                <span
                  v-if="authStore.isAuthenticated && isOwnedResource(resource)"
                  class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                  >已获取</span
                >
                <span
                  v-else-if="authStore.isAuthenticated"
                  class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
                  >未获取</span
                >
              </div>
            </div>
          </div>
          <div class="flex items-center gap-6 text-sm text-slate-500 mb-6">
            <span class="flex items-center gap-1 text-orange-500 font-medium">
              <span class="material-symbols-outlined text-sm fill-1">star</span>
              {{ (resource.ratingAvg ?? 0).toFixed(1) }} ({{ resource.ratingCount ?? 0 }}条评价)
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">download</span>
              {{ resource.downloadCount }} 次下载
            </span>
            <span v-if="isFreeResource(resource)" class="text-green-600 font-bold">免费</span>
            <span v-else class="text-primary font-bold">{{ resource.pointsCost }} 积分</span>
            <span v-if="resource.tags.length" class="truncate"
              >标签：{{ resource.tags.join(" / ") }}</span
            >
          </div>
          <p
            class="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed italic border-l-4 border-slate-200 dark:border-slate-700 pl-4"
          >
            {{ formatDescription(resource) }}
          </p>
          <hr class="border-t border-dashed border-slate-300 dark:border-slate-700" />
        </a>

        <div
          v-if="!isLoading && totalPages > 1"
          class="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800"
        >
          <p class="text-sm text-slate-500">第 {{ currentPage }} / {{ totalPages }} 页</p>
          <div class="flex items-center gap-2">
            <button
              class="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              :disabled="currentPage <= 1"
              @click="changePage(currentPage - 1)"
            >
              <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              v-for="page in pageNumbers"
              :key="page"
              :class="[
                'size-8 flex items-center justify-center rounded text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800',
              ]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <button
              class="size-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              :disabled="currentPage >= totalPages"
              @click="changePage(currentPage + 1)"
            >
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
