<template>
  <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-2">
        <h3 class="text-md font-medium text-gray-900 dark:text-white">نظام مؤشر التحميل الموحد</h3>
        <p class="max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          اختر الشكل والحجم واللون والسرعة، ثم احفظ الإعدادات ليتم تطبيق نفس المؤشر على
          اللودرات الموحدة في المشروع كله.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        @click="previewTheme = previewTheme === 'dark' ? 'light' : 'dark'"
      >
        {{ previewTheme === 'dark' ? 'معاينة فاتحة' : 'معاينة داكنة' }}
      </button>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">الشكل</label>
        <BaseSelect v-model="settings.loader_spinner_variant" select-class="form-select" :options="variantOptions" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">الحجم</label>
        <BaseSelect v-model="settings.loader_spinner_size" select-class="form-select" :options="sizeOptions" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">اللون</label>
        <BaseSelect v-model="settings.loader_spinner_color" select-class="form-select" :options="colorOptions" />
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">السرعة</label>
        <BaseSelect v-model="settings.loader_spinner_speed" select-class="form-select" :options="speedOptions" />
      </div>
    </div>

    <div class="mt-6 rounded-[1.5rem] border border-gray-200/80 p-4 dark:border-gray-700">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div
          :class="previewCardClasses"
          class="rounded-[1.25rem] border p-5"
        >
          <p class="mb-4 text-sm font-medium">معاينة التنقل بين الصفحات</p>
          <div class="flex min-h-[110px] items-center justify-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full border border-brand-200/70 bg-white/88 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-brand-500/15 dark:bg-neutral-950/80">
              <BaseSpinner
                usage="route"
                :variant="settings.loader_spinner_variant"
                :size="settings.loader_spinner_size"
                :color="settings.loader_spinner_color"
              />
            </div>
          </div>
        </div>

        <div
          :class="previewCardClasses"
          class="rounded-[1.25rem] border p-5"
        >
          <p class="mb-4 text-sm font-medium">معاينة طبقة الحجب</p>
          <div class="relative overflow-hidden rounded-[1.25rem] border border-white/10">
            <div class="h-[110px] bg-gray-100/80 dark:bg-gray-900/70"></div>
            <div class="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm dark:bg-neutral-950/70">
              <div class="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200/80 bg-white/92 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/92">
                <BaseSpinner
                  usage="overlay"
                  :variant="settings.loader_spinner_variant"
                  :size="settings.loader_spinner_size"
                  :color="settings.loader_spinner_color"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          :class="previewCardClasses"
          class="rounded-[1.25rem] border p-5"
        >
          <p class="mb-4 text-sm font-medium">معاينة داخل عنصر</p>
          <div class="flex min-h-[110px] items-center justify-center">
            <button
              type="button"
              class="inline-flex min-w-[180px] items-center justify-center gap-3 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
            >
              <BaseSpinner
                usage="action"
                size="sm"
                color="white"
                :variant="settings.loader_spinner_variant"
              />
              <span>جارٍ التنفيذ</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="option in variantCards"
        :key="option.value"
        type="button"
        class="group rounded-[1.4rem] border p-4 text-right transition-all"
        :class="
          settings.loader_spinner_variant === option.value
            ? 'border-brand-400 bg-brand-50/80 shadow-lg dark:border-brand-400/70 dark:bg-brand-500/10'
            : 'border-gray-200 bg-white/70 hover:border-brand-200 hover:bg-brand-50/40 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-brand-500/30 dark:hover:bg-gray-800/70'
        "
        @click="settings.loader_spinner_variant = option.value"
      >
        <div
          :class="previewCardClasses"
          class="mb-4 flex min-h-[132px] items-center justify-center rounded-[1.2rem] border"
        >
          <BaseSpinner
            usage="section"
            :variant="option.value"
            :size="settings.loader_spinner_size"
            :color="settings.loader_spinner_color"
          />
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-3">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">{{ option.label }}</h4>
            <span
              v-if="settings.loader_spinner_variant === option.value"
              class="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white"
            >
              المحدد
            </span>
          </div>
          <p class="text-xs leading-6 text-gray-500 dark:text-gray-400">{{ option.description }}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { BaseSelect, BaseSpinner } from '@/components/base';

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
});

const previewTheme = ref('dark');

const variantCards = [
  { value: 'arc-gradient', label: 'قوس متدرج', description: 'رسمي ومحايد ومناسب كخيار افتراضي شامل.' },
  { value: 'dual-ring', label: 'حلقتان متوازنتان', description: 'يعطي إحساساً تقنياً هادئاً دون فوضى.' },
  { value: 'segmented', label: 'شرائح دائرية', description: 'حديث وواضح ويشبه طابع منصات SaaS.' },
  { value: 'orbit-dot', label: 'مدار نقطة', description: 'سهل الإدراك لأن العين تتبع نقطة واحدة واضحة.' },
  { value: 'draw-arc', label: 'دائرة مرسومة', description: 'يوحي بالدقة والموثوقية والبناء الهندسي.' },
  { value: 'spokes', label: 'أشعة محيطية', description: 'واضح جداً حتى في الأحجام الصغيرة.' },
  { value: 'square-corners', label: 'زوايا مربعة', description: 'أكثر هندسية وملائم للواجهات الإدارية.' },
  { value: 'diamond', label: 'ماسة ناعمة', description: 'مميز بصرياً ولكن ما زال هادئاً.' },
  { value: 'ripple', label: 'تموجات', description: 'مريح جداً لشاشات البداية والانتظار الهادئ.' },
  { value: 'segmented-soft', label: 'مقاطع موزونة', description: 'مرشح قوي كنظام موحد داخل المشروع.' },
  { value: 'fine-dash', label: 'مسار رفيع', description: 'فخم وناضج ويصلح للواجهات الراقية.' },
  { value: 'bars', label: 'أعمدة متناظرة', description: 'أوضح في بعض الحالات لكنه أقل حيادية من الدوائر.' },
];

const variantOptions = variantCards.map((option) => ({
  label: option.label,
  value: option.value,
}));

const sizeOptions = [
  { label: 'صغير جداً', value: 'xs' },
  { label: 'صغير', value: 'sm' },
  { label: 'متوسط', value: 'md' },
  { label: 'كبير', value: 'lg' },
  { label: 'كبير جداً', value: 'xl' },
];

const colorOptions = [
  { label: 'أساسي', value: 'primary' },
  { label: 'رمادي', value: 'gray' },
  { label: 'أبيض', value: 'white' },
];

const speedOptions = [
  { label: 'هادئة', value: 'slow' },
  { label: 'متوازنة', value: 'normal' },
  { label: 'أسرع', value: 'fast' },
];

const previewCardClasses = computed(() =>
  previewTheme.value === 'dark'
    ? 'border-slate-800 bg-slate-950 text-slate-100'
    : 'border-slate-200 bg-slate-50 text-slate-900'
);

const settings = props.settings;
</script>
