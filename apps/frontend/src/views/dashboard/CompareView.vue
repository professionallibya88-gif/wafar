<template>
  <div class="space-y-8">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">
          مقارنة القطع
        </h1>
        <p class="mt-1 text-neutral-500 dark:text-neutral-400">
          قارن بين القطع المختارة للعثور على
          أفض عرض
        </p>
      </div>
      <BaseButton
        v-if="parts.length > 0"
        @click="$router.push('/search')"
        variant="outline"
      >
        <template #iconLeft>
          <AppIcon name="plus" class="w-4 h-4" />
        </template>
        إضافة قطع
      </BaseButton>
    </div>

    <!-- Compare Table -->
    <div
      v-if="parts.length > 0"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-neutral-50 dark:bg-neutral-900">
            <!-- Header Row -->
            <tr>
              <th
                class="px-4 py-4 text-right text-sm font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 w-48 sticky right-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
              >
                القطعة / الكود
              </th>
              <th
                v-for="part in parts"
                :key="'header-' + part.id"
                class="px-6 py-4 min-w-[280px]"
              >
                <div class="flex flex-col gap-2">
                  <div class="flex justify-between items-start">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-brand-600 dark:text-brand-400">
                        {{ part.oem_number || "-" }}
                      </span>
                      <span class="text-xs font-mono text-neutral-500">
                        {{ part.part_code || part.item_number || "-" }}
                      </span>
                    </div>
                    <button
                      @click="removePart(part.id)"
                      class="text-neutral-400 hover:text-red-500 transition-colors"
                      title="إزالة من المقارنة"
                    >
                      <AppIcon name="XMark" size="sm" />
                    </button>
                  </div>
                  <h3 class="font-bold text-neutral-900 dark:text-white line-clamp-2">
                    {{ part.part_name || "-" }}
                  </h3>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
            <!-- Supplier -->
            <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
              <td
                class="px-4 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 sticky right-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
              >
                الشركة الموردة
              </td>
              <td
                v-for="part in parts"
                :key="'supplier-' + part.id"
                class="px-6 py-4 text-sm text-neutral-900 dark:text-white"
              >
                {{ part.supplier?.name || part.supplier_name_text || part.supplier_name || "-" }}
              </td>
            </tr>

            <!-- Cash Price -->
            <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
              <td
                class="px-4 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 sticky right-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
              >
                السعر النقدي
              </td>
              <td
                v-for="part in parts"
                :key="'price-cash-' + part.id"
                class="px-6 py-4"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="text-base font-bold"
                    :class="
                      isLowestPrice(part, 'price_cash')
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-neutral-900 dark:text-white'
                    "
                  >
                    {{ formatCurrency(part.price_cash || part.price, "د.ع") }}
                  </span>
                  <BaseBadge v-if="isLowestPrice(part, 'price_cash')" variant="success" size="sm">
                    الأقل سعراً
                  </BaseBadge>
                </div>
              </td>
            </tr>

            <!-- Bank Price -->
            <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
              <td
                class="px-4 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 sticky right-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
              >
                السعر المصرفي
              </td>
              <td
                v-for="part in parts"
                :key="'price-bank-' + part.id"
                class="px-6 py-4"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="text-base font-bold"
                    :class="
                      isLowestPrice(part, 'price_bank')
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-neutral-900 dark:text-white'
                    "
                  >
                    {{ formatCurrency(part.price_bank, "د.ع") }}
                  </span>
                  <BaseBadge v-if="isLowestPrice(part, 'price_bank') && part.price_bank" variant="success" size="sm">
                    الأقل سعراً
                  </BaseBadge>
                </div>
              </td>
            </tr>

            <!-- Quality & Brand -->
            <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
              <td
                class="px-4 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 sticky right-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
              >
                الشركة/المنشأ
              </td>
              <td
                v-for="part in parts"
                :key="'brand-origin-' + part.id"
                class="px-6 py-4 text-sm text-neutral-900 dark:text-white"
              >
                <div class="flex flex-col gap-1">
                  <span v-if="part.brand" class="font-medium text-neutral-800 dark:text-neutral-300">{{ part.brand }}</span>
                  <span v-if="part.origin_country" class="text-xs text-neutral-500">{{ part.origin_country }}</span>
                  <BaseBadge v-if="part.quality" :variant="qualityVariant(part.quality)" size="xs" class="w-fit mt-1">
                    {{ qualityLabel(part.quality) }}
                  </BaseBadge>
                  <span v-if="!part.brand && !part.origin_country">-</span>
                </div>
              </td>
            </tr>

            <!-- Availability -->
            <tr class="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
              <td
                class="px-4 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 sticky right-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
              >
                التوفر (الكمية)
              </td>
              <td
                v-for="part in parts"
                :key="'availability-' + part.id"
                class="px-6 py-4"
              >
                <div class="flex flex-col gap-1">
                  <span
                    :class="
                      part.in_stock
                        ? 'text-green-600 dark:text-green-400 font-medium'
                        : 'text-red-600 dark:text-red-400 font-medium'
                    "
                  >
                    {{ part.in_stock ? "متوفر" : "غير متوفر" }}
                  </span>
                  <span v-if="part.quantity_available" class="text-xs text-neutral-500">
                    الكمية المتاحة: {{ part.quantity_available }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-16 text-center border border-neutral-100 dark:border-neutral-700"
    >
      <div
        class="w-20 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-2xl mx-auto mb-6 flex items-center justify-center"
      >
        <AppIcon
          name="chart-bar"
          class="w-10 h-10 text-neutral-400 dark:text-neutral-500"
        />
      </div>
      <h3 class="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
        لا توجد قطع مقارنة
      </h3>
      <p class="text-neutral-500 dark:text-neutral-400 mb-6">
        اختر قطعاً من صفحة البحث لمقارنتها
      </p>
      <BaseButton @click="$router.push('/search')" variant="primary">
        <template #iconLeft>
          <AppIcon name="magnifying-glass" class="w-4 h-4" />
        </template>
        الذهاب إلى البحث
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { searchAPI } from "@/services/api";
import { formatCurrency } from "@/utils/currency";
import { BaseButton, BaseBadge } from "@/components/base";
import { AppIcon } from "@/components/icons";

const route = useRoute();
const parts = ref([]);

onMounted(async () => {
  const ids = route.query.ids;
  if (ids) {
    try {
      const res = await searchAPI.compare(ids);
      parts.value = res.data?.data || [];
    } catch (error) { /* ignore */ }
  }
});

const qualityLabel = (q) =>
  ({
    original: "أصلي",
    high: "جيد",
    medium: "متوسط",
    low: "اقتصادي",
    unspecified: "غير محدد",
  })[q] || q;
const qualityVariant = (q) =>
  ({
    original: "success",
    high: "info",
    medium: "warning",
    low: "error",
    unspecified: "default",
  })[q] || "default";

// Find lowest price
const isLowestPrice = (part, priceField = "price_cash") => {
  const currentPrice = part[priceField] || part.price;
  if (!currentPrice) return false;

  const allPrices = parts.value
    .map((p) => p[priceField] || p.price)
    .filter((p) => p)
    .map((p) => parseFloat(p));

  if (allPrices.length === 0) return false;
  return parseFloat(currentPrice) === Math.min(...allPrices);
};
</script>
