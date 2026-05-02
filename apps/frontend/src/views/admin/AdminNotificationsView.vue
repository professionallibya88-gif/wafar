<template>
  <div class="admin-notifications-view space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">إدارة الإشعارات</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">إدارة إعدادات وقوالب الإشعارات في النظام</p>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 class="text-lg font-semibold mb-4">إعدادات الإشعارات</h2>
      <form @submit.prevent="saveSettings" class="space-y-6">
        
        <!-- General Settings -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تفعيل الإشعارات البريدية</label>
            <BaseSelect
  v-model="settings.emailEnabled"
  select-class="form-select"
  :options="[
    { label: 'مفعل', value: true },
    { label: 'معطل', value: false },
  ]"
/>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تفعيل إشعارات النظام (Push)</label>
            <BaseSelect
  v-model="settings.pushEnabled"
  select-class="form-select"
  :options="[
    { label: 'مفعل', value: true },
    { label: 'معطل', value: false },
  ]"
/>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button type="submit" class="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors">
            حفظ الإعدادات
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { BaseSelect } from "@/components/base";
import { ref } from 'vue'

const settings = ref({
  emailEnabled: true,
  pushEnabled: true
})

const saveSettings = () => {
  // Save logic
}
</script>
