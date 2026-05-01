<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          باقات الاشتراك
        </h1>
        <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          اختر الباقة المناسبة لاحتياجاتك
        </p>
      </div>
    </div>

    <!-- Current Plan Banner -->
    <div
      v-if="currentPlanId"
      class="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 bg-brand-100 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center"
        >
          <AppIcon name="CheckCircle" size="lg" color="brand" />
        </div>
        <div>
          <p class="font-semibold text-neutral-900 dark:text-neutral-100">
            باقتك الحالية
          </p>
          <p class="text-sm text-neutral-600 dark:text-neutral-300">
            استمتع بجميع مزايا باقتك
          </p>
        </div>
      </div>
    </div>

    <!-- Plans Grid -->
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[var(--card-glow)] dark:bg-neutral-800"
        :class="[
          currentPlanId === plan.id
            ? 'border-brand-500 dark:border-brand-400 bg-brand-50/10 dark:bg-brand-900/10'
            : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800',
        ]"
        :style="getPlanCardStyle(plan)"
      >
        <!-- Popular Badge (if we have a field for it, else ignore) -->
        <div v-if="plan.popular" class="absolute -top-3 right-4 z-10">
          <span
            class="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
          >
            الأكثر طلباً
          </span>
        </div>

        <!-- Header with Dynamic Color -->
        <div
          class="relative border-b border-neutral-100 p-4 transition-colors duration-500 dark:border-neutral-700/50"
          :style="{ 
            backgroundColor: `${normalizeColor(plan.color_hex, plan.plan_type)}05`,
            borderTop: `4px solid ${normalizeColor(plan.color_hex, plan.plan_type)}`
          }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <span
                  class="inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm transition-transform group-hover:scale-105"
                  :style="getPillStyle(normalizeColor(plan.color_hex, plan.plan_type))"
                >
                  {{ getPlanTypeLabel(plan.plan_type) }}
                </span>
                <span
                  v-if="currentPlanId === plan.id"
                  class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black shadow-sm transition-transform group-hover:scale-105 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                >
                  <span class="h-1 w-1 rounded-full bg-emerald-500"></span>
                  باقتك الحالية
                </span>
              </div>
              <h2 class="truncate text-lg font-black tracking-tight text-neutral-900 transition-colors group-hover:text-neutral-950 dark:text-white dark:group-hover:text-white">
                {{ plan.name_ar }}
              </h2>
              <p class="truncate text-[10px] font-bold text-neutral-400 uppercase tracking-tighter dark:text-neutral-500" dir="ltr">
                {{ plan.name_en || plan.name }}
              </p>
            </div>

            <div 
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 dark:bg-neutral-900 dark:ring-neutral-700"
            >
              <AppIcon name="ShieldCheck" size="md" :style="{ color: normalizeColor(plan.color_hex, plan.plan_type) }" />
            </div>
          </div>
        </div>

        <!-- Body Content -->
        <div class="flex-1 p-4 space-y-4">
          <p class="line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {{ plan.description || "لا يوجد وصف لهذه الباقة." }}
          </p>

          <div class="grid grid-cols-1 gap-3">
            <!-- Price Section -->
            <div class="group/section flex items-center justify-between rounded-xl bg-neutral-50 p-3 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-900">
              <div class="flex items-center gap-2">
                <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-neutral-800">
                  <AppIcon name="Banknotes" size="xs" class="text-neutral-400" />
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-black uppercase tracking-wider text-neutral-400">السعر</span>
                  <p class="text-[10px] font-medium text-neutral-500">
                    {{ plan.duration_days > 0 ? `${plan.duration_days} يوم` : "مجانية" }}
                  </p>
                </div>
              </div>
              <div class="flex items-baseline gap-0.5">
                <span class="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                  {{ formatCurrency(plan.price, '') }}
                </span>
                <span class="text-[9px] font-bold text-neutral-400">{{ plan.currency || 'LYD' }}</span>
              </div>
            </div>

            <!-- Limits Section -->
            <div class="group/section rounded-xl bg-neutral-50 p-3 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/50 dark:hover:bg-neutral-900">
              <div class="mb-2 flex items-center gap-2">
                <AppIcon name="ChartBar" size="xs" class="text-neutral-400" />
                <span class="text-[9px] font-black uppercase tracking-wider text-neutral-400">الحدود اليومية</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <span class="block text-[8px] font-bold text-neutral-400 uppercase">البحث</span>
                  <span class="text-[10px] font-black text-neutral-900 dark:text-neutral-200">{{ formatLimit(plan.max_searches_per_day) }}</span>
                </div>
                <div class="flex-1 border-r border-neutral-200 pr-4 dark:border-neutral-700">
                  <span class="block text-[8px] font-bold text-neutral-400 uppercase">الرفع</span>
                  <span class="text-[10px] font-black text-neutral-900 dark:text-neutral-200">{{ formatLimit(plan.max_pdf_uploads) }}</span>
                </div>
              </div>
            </div>

            <!-- Features Checkmarks -->
            <ul class="space-y-2 mt-2">
              <li class="flex items-center gap-2 text-xs">
                <AppIcon
                  :name="plan.permissions?.compare_parts || plan.can_compare ? 'CheckCircle' : 'XCircle'"
                  size="sm"
                  :class="plan.permissions?.compare_parts || plan.can_compare ? 'text-emerald-500' : 'text-neutral-300 dark:text-neutral-600'"
                />
                <span :class="plan.permissions?.compare_parts || plan.can_compare ? 'text-neutral-700 dark:text-neutral-300 font-medium' : 'text-neutral-400 dark:text-neutral-500'">مقارنة القطع</span>
              </li>
              <li class="flex items-center gap-2 text-xs">
                <AppIcon
                  :name="plan.permissions?.export_results || plan.can_export ? 'CheckCircle' : 'XCircle'"
                  size="sm"
                  :class="plan.permissions?.export_results || plan.can_export ? 'text-emerald-500' : 'text-neutral-300 dark:text-neutral-600'"
                />
                <span :class="plan.permissions?.export_results || plan.can_export ? 'text-neutral-700 dark:text-neutral-300 font-medium' : 'text-neutral-400 dark:text-neutral-500'">تصدير النتائج</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Actions Footer -->
        <div class="border-t border-neutral-100 bg-neutral-50/30 p-4 transition-colors group-hover:bg-neutral-50 dark:border-neutral-700/50 dark:bg-neutral-900/20 dark:group-hover:bg-neutral-900/40 mt-auto">
          <button
            v-if="currentPlanId !== plan.id && plan.price > 0"
            @click="subscribe(plan)"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition shadow-sm hover:opacity-90"
            :class="getContrastTextColorClass(normalizeColor(plan.color_hex, plan.plan_type))"
            :style="{ backgroundColor: normalizeColor(plan.color_hex, plan.plan_type) }"
          >
            اشترك الآن
          </button>
          <div v-else-if="currentPlanId === plan.id" class="text-center w-full py-2.5">
            <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
              <AppIcon name="CheckCircle" size="sm" />
              باقتك الحالية
            </span>
          </div>
          <button 
            v-else 
            disabled
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
          >
            مجاني
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="plans.length === 0"
      class="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900"
      >
        <AppIcon
          name="Swatch"
          size="xl"
          customClass="text-neutral-400 dark:text-neutral-500"
        />
      </div>
      <h3 class="mt-5 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        لا توجد باقات
      </h3>
      <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        تواصل مع المسؤول لإضافة باقات جديدة
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { subscriptionAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { formatCurrency } from "@/utils/currency";
import { getContrastTextColorClass } from "@/utils/color";

const router = useRouter();
const plans = ref([]);
const currentPlanId = ref(null);

const defaultColors = {
  free: "#64748B",
  basic: "#2563EB",
  professional: "#7C3AED",
  enterprise: "#0F766E",
  custom: "#EA580C",
};

const planTypeOptions = [
  { value: "free", label: "مجانية" },
  { value: "basic", label: "أساسية" },
  { value: "professional", label: "احترافية" },
  { value: "enterprise", label: "مؤسسية" },
  { value: "custom", label: "مخصصة" },
];

onMounted(async () => {
  try {
    const [plansRes, subRes] = await Promise.all([
      subscriptionAPI.getPlans(),
      subscriptionAPI.getMySubscription(),
    ]);
    plans.value = plansRes.data?.data || [];
    currentPlanId.value = subRes.data?.data?.plan_id || null;
  } catch (error) { /* ignore */ }
});

const subscribe = (plan) => {
  router.push({ path: "/payments", query: { plan_id: plan.id } });
};

const getPlanTypeLabel = (type) =>
  planTypeOptions.find((option) => option.value === type)?.label || "غير محدد";

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));

const formatLimit = (value) =>
  value === null || value === undefined || Number(value) === 0 ? "غير محدود" : formatNumber(value);

const normalizeColor = (color, type = 'basic') => {
  if (typeof color !== "string") {
    return defaultColors[type] || defaultColors.basic;
  }
  const normalized = color.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : (defaultColors[type] || defaultColors.basic);
};

const getPillStyle = (color) => {
  return {
    backgroundColor: `${color}12`,
    color: color,
    border: `1px solid ${color}26`,
  };
};

const getPlanCardStyle = (plan) => {
  const color = normalizeColor(plan.color_hex, plan.plan_type);
  return {
    '--card-glow': `${color}1A`,
    boxShadow: `0 10px 30px -15px ${color}33`,
  };
};
</script>
