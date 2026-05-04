<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- الإعدادات -->
      <div class="space-y-4">
        <!-- الشكل -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            الشكل (Variant)
          </label>
          <BaseSelect
            v-model="modelValue.loader_spinner_variant"
            select-class="form-select"
            :options="[
              { label: 'حلقتان هندسيتان (Dual Ring)', value: 'dual-ring' },
              { label: 'نقاط متتابعة (Sequential Dots)', value: 'sequential-dots' },
            ]"
          />
        </div>

        <!-- الحجم -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            الحجم (Size)
          </label>
          <BaseSelect
            v-model="modelValue.loader_spinner_size"
            select-class="form-select"
            :options="[
              { label: 'صغير جداً (XS)', value: 'xs' },
              { label: 'صغير (SM)', value: 'sm' },
              { label: 'متوسط (MD)', value: 'md' },
              { label: 'كبير (LG)', value: 'lg' },
              { label: 'كبير جداً (XL)', value: 'xl' },
            ]"
          />
        </div>

        <!-- اللون -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            اللون (Color)
          </label>
          <BaseSelect
            v-model="modelValue.loader_spinner_color"
            select-class="form-select"
            :options="[
              { label: 'اللون الرئيسي (Primary)', value: 'primary' },
              { label: 'رمادي (Gray)', value: 'gray' },
            ]"
          />
        </div>

        <!-- السرعة -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            السرعة (Speed)
          </label>
          <BaseSelect
            v-model="modelValue.loader_spinner_speed"
            select-class="form-select"
            :options="[
              { label: 'بطيء (Slow)', value: 'slow' },
              { label: 'عادي (Normal)', value: 'normal' },
              { label: 'سريع (Fast)', value: 'fast' },
            ]"
          />
        </div>
      </div>

      <!-- المعاينة المباشرة -->
      <div class="space-y-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          معاينة مباشرة
        </h4>
        <div class="h-[250px] w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <BaseSpinner
            :variant="modelValue.loader_spinner_variant || 'dual-ring'"
            :size="modelValue.loader_spinner_size || 'md'"
            :color="modelValue.loader_spinner_color || 'primary'"
            :speed="modelValue.loader_spinner_speed || 'normal'"
            usage="inline"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BaseSelect, BaseSpinner } from "@/components/base";

const modelValue = defineModel({ type: Object, required: true });
</script>
