<template>
  <div class="space-y-8">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          سجل البحث
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          استرجع عمليات البحث السابقة
        </p>
      </div>
      <BaseButton @click="$router.push('/search')" variant="primary">
        <template #iconLeft>
          <AppIcon name="magnifying-glass" class="w-4 h-4" />
        </template>
        بحث جديد
      </BaseButton>
    </div>

    <!-- Search History Card -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div
        class="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between"
      >
        <h2
          class="font-semibold text-gray-900 dark:text-white flex items-center gap-2"
        >
          <AppIcon
            name="clock"
            class="w-5 h-5 text-gray-400 dark:text-gray-500"
          />
          عمليات البحث
        </h2>
        <span
          class="text-sm text-gray-500 dark:text-gray-400 bg-brand-50 dark:bg-gray-700 px-3 py-1 rounded-full"
          >{{ history.length }} عملية</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-brand-50 dark:bg-gray-900">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                البحث
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                النوع
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                النتائج
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                التاريخ
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="h in history"
              :key="h.id"
              class="hover:bg-brand-50/30 dark:hover:bg-brand-900/20 cursor-pointer transition-colors group"
              @click="searchAgain(h.query)"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-brand-50 dark:bg-neutral-900/30 rounded-lg flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-800/50 transition-colors"
                  >
                    <AppIcon
                      name="magnifying-glass"
                      class="w-4 h-4 text-brand-600 dark:text-neutral-400"
                    />
                  </div>
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
                    >{{ h.query }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-gray-600 dark:text-gray-300">{{
                  searchTypeLabel(h.search_type)
                }}</span>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-100 dark:bg-neutral-900/30 text-brand-700 dark:text-neutral-300"
                >
                  {{ h.results_count }} نتيجة
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ new Date(h.createdAt).toLocaleDateString("ar-LY") }}
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="history.length === 0" class="text-center py-16">
          <div
            class="w-20 h-20 bg-brand-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <AppIcon
              name="clock"
              class="w-10 h-10 text-gray-400 dark:text-gray-500"
            />
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
            لا توجد عمليات بحث
          </p>
          <p class="text-gray-400 dark:text-gray-500 text-sm">
            ابدأ بالبحث للعثور على القطع التي تحتاجها
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { searchAPI } from "@/services/api";
import BaseButton from "@/components/base/BaseButton.vue";
import { AppIcon } from "@/components/icons";

const router = useRouter();
const history = ref([]);

onMounted(async () => {
  try {
    const res = await searchAPI.getHistory({ limit: 100 });
    history.value = res.data?.data?.history || [];
  } catch (error) { /* ignore */ }
});

const searchAgain = (query) => {
  router.push({ path: "/search", query: { q: query } });
};
const searchTypeLabel = (t) =>
  ({
    code: "بالكود",
    name: "بالاسم",
    category: "بالفئة",
    advanced: "متقدم",
  })[t] || t;
</script>
