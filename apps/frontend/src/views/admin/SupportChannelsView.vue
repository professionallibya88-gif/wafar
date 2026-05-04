<template>
  <div class="page-shell">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="page-title">قنوات الدعم والتواصل</h1>
        <p class="page-subtitle">إدارة قنوات التواصل المتاحة للعملاء</p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <BaseButton @click="openCreateForm" variant="primary" class="inline-flex items-center gap-2">
          <AppIcon name="Plus" size="md" color="white" />
          إضافة قناة
        </BaseButton>
      </div>
    </div>

    <!-- Table -->
    <div class="panel-table">
      <div class="p-4 border-b border-neutral-200/70 dark:border-neutral-800/70">
        <h3 class="font-bold text-gray-900 dark:text-white">قائمة القنوات</h3>
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                القناة
              </th>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                النوع
              </th>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                القيمة (الرابط/الرقم)
              </th>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الحالة
              </th>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            <tr v-if="isLoading" class="animate-pulse">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                جاري التحميل...
              </td>
            </tr>
            <tr v-else-if="channels.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                لا توجد قنوات مضافة حالياً.
              </td>
            </tr>
            <tr v-else v-for="channel in channels" :key="channel.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <AppIcon :name="channel.icon || getIconName(channel.type)" size="md" />
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ channel.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  {{ getTypeLabel(channel.type) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400" dir="ltr">
                {{ channel.value }}
              </td>
              <td class="px-6 py-4">
                <button
                  @click="toggleActive(channel)"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="channel.is_active ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
                >
                  <span class="sr-only">تبديل الحالة</span>
                  <span
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                    :class="channel.is_active ? '-translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <button @click="openEditForm(channel)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    <AppIcon name="Pencil" size="sm" />
                  </button>
                  <button @click="confirmDelete(channel)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                    <AppIcon name="Trash" size="sm" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <BaseModal v-if="showForm" :title="isEditing ? 'تعديل قناة التواصل' : 'إضافة قناة تواصل'" @close="closeForm">
      <form @submit.prevent="submitForm" class="space-y-4 p-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم القناة</label>
          <input v-model="form.name" required type="text" class="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="مثال: واتساب الدعم الفني" />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع القناة</label>
          <BaseSelect
  v-model="form.type"
  select-class="form-select"
  required
  :options="[
    { label: 'واتساب', value: 'whatsapp' },
    { label: 'هاتف', value: 'phone' },
    { label: 'رابط موقع', value: 'link' },
  ]"
/>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القيمة (الرقم/الرابط)</label>
          <input v-model="form.value" required type="text" dir="ltr" class="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-left" placeholder="مثال: +218911234567" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الأيقونة (اختياري)</label>
          <input v-model="form.icon" type="text" dir="ltr" class="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-left" placeholder="مثال: chat-bubble-left-right" />
          <p class="text-xs text-gray-500 mt-1">يترك فارغاً لاستخدام الأيقونة الافتراضية للنوع.</p>
        </div>

        <div class="flex items-center mt-2">
          <input v-model="form.is_active" type="checkbox" id="is_active" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
          <label for="is_active" class="mr-2 block text-sm text-gray-900 dark:text-gray-300">نشط</label>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <BaseButton type="button" variant="outline" @click="closeForm">إلغاء</BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="isSaving">
            {{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirm Modal -->
    <BaseModal v-if="showDeleteConfirm" title="تأكيد الحذف" @close="showDeleteConfirm = false">
      <div class="p-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mx-auto mb-4">
          <AppIcon name="ExclamationTriangle" size="lg" />
        </div>
        <h3 class="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">هل أنت متأكد من حذف هذه القناة؟</h3>
        <p class="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
          لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
        </p>
        <div class="flex justify-center gap-3">
          <BaseButton type="button" variant="outline" @click="showDeleteConfirm = false">إلغاء</BaseButton>
          <BaseButton type="button" variant="danger" @click="executeDelete" :disabled="isDeleting">
            {{ isDeleting ? 'جاري الحذف...' : 'حذف القناة' }}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supportAPI } from '@/services/api';
import { AppIcon } from '@/components/icons';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseSelect from '@/components/base/BaseSelect.vue';

const channels = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const isDeleting = ref(false);

const showForm = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const channelToDelete = ref(null);

const form = ref({
  id: null,
  name: '',
  type: 'whatsapp',
  value: '',
  icon: '',
  is_active: true
});

const fetchChannels = async () => {
  try {
    isLoading.value = true;
    const response = await supportAPI.getChannels();
    if (response.success) {
      channels.value = response.data || [];
    }
  } catch (error) {
    console.error('Error fetching channels:', error);
  } finally {
    isLoading.value = false;
  }
};

const getIconName = (type) => {
  switch (type) {
    case 'whatsapp': return 'chat-bubble-left-right';
    case 'phone': return 'phone';
    case 'email': return 'envelope';
    default: return 'Globe';
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'whatsapp': return 'واتساب';
    case 'phone': return 'هاتف';
    case 'email': return 'بريد إلكتروني';
    case 'link': return 'رابط';
    default: return type;
  }
};

const openCreateForm = () => {
  isEditing.value = false;
  form.value = {
    id: null,
    name: '',
    type: 'whatsapp',
    value: '',
    icon: '',
    is_active: true
  };
  showForm.value = true;
};

const openEditForm = (channel) => {
  isEditing.value = true;
  form.value = { ...channel };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

const submitForm = async () => {
  try {
    isSaving.value = true;
    const payload = { ...form.value };
    delete payload.id;
    
    let response;
    if (isEditing.value) {
      response = await supportAPI.updateChannel(form.value.id, payload);
    } else {
      response = await supportAPI.createChannel(payload);
    }
    
    if (response.success) {
      await fetchChannels();
      closeForm();
    }
  } catch (error) {
    console.error('Error saving channel:', error);
  } finally {
    isSaving.value = false;
  }
};

const toggleActive = async (channel) => {
  try {
    const response = await supportAPI.toggleChannelActive(channel.id);
    if (response.success) {
      channel.is_active = response.data.is_active;
    }
  } catch (error) {
    console.error('Error toggling active status:', error);
  }
};

const confirmDelete = (channel) => {
  channelToDelete.value = channel;
  showDeleteConfirm.value = true;
};

const executeDelete = async () => {
  if (!channelToDelete.value) return;
  
  try {
    isDeleting.value = true;
    const response = await supportAPI.deleteChannel(channelToDelete.value.id);
    if (response.success) {
      channels.value = channels.value.filter(c => c.id !== channelToDelete.value.id);
      showDeleteConfirm.value = false;
    }
  } catch (error) {
    console.error('Error deleting channel:', error);
  } finally {
    isDeleting.value = false;
    channelToDelete.value = null;
  }
};

onMounted(() => {
  fetchChannels();
});
</script>
