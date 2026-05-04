<template>
  <div class="space-y-6">
    <BaseToast ref="toast" />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          إدارة مزودي الذكاء الاصطناعي
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          إعداد وإدارة مزودي الذكاء الاصطناعي المتعددين
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <button
          @click="seedDefaults"
          :disabled="seeding"
          class="px-4 py-2 text-sm font-medium text-brand-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-brand-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <BaseSpinner v-if="seeding" size="xs" usage="action" />
          <AppIcon v-else name="Sparkles" size="sm" />
          {{ seeding ? 'جاري الإضافة...' : 'إضافة افتراضيات' }}
        </button>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2"
        >
          <AppIcon name="Plus" size="sm" />
          مزود جديد
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">إجمالي المزودين</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total || 0 }}</p>
          </div>
          <div class="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
            <AppIcon name="CpuChip" size="lg" customClass="text-brand-600" />
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">المزودون المفعلون</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.enabled || 0 }}</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <AppIcon name="CheckCircle" size="lg" customClass="text-green-600" />
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">الطلبات اليوم</p>
            <p class="text-2xl font-bold text-blue-600">{{ todayRequests }}</p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <AppIcon name="ChartBar" size="lg" customClass="text-blue-600" />
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">التكلفة الإجمالية</p>
            <p class="text-2xl font-bold text-purple-600">${{ totalCost }}</p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <AppIcon name="CurrencyDollar" size="lg" customClass="text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Providers Table -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">قائمة المزودين</h2>
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المزود</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">النوع</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الأولوية</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">التكلفة/1K</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">آخر فحص</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="provider in providers" :key="provider.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ provider.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ provider.default_model }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {{ provider.provider_type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 py-1 text-xs rounded-full': true,
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300': provider.enabled && provider.last_health_status === 'healthy',
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300': provider.enabled && provider.last_health_status === 'degraded',
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300': !provider.enabled || provider.last_health_status === 'unhealthy',
                  }"
                >
                  {{ provider.enabled ? (provider.last_health_status === 'healthy' ? 'نشط' : provider.last_health_status === 'degraded' ? 'منحدر' : 'غير معروف') : 'معطل' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ provider.priority }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${{ provider.cost_per_1k_input_tokens }}/{{ provider.cost_per_1k_output_tokens }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ provider.last_health_check_at ? new Date(provider.last_health_check_at).toLocaleString('ar-LY') : 'لم يتم الفحص' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <button @click="testProvider(provider.id)" class="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400" title="اختبار">
                    <AppIcon name="Bolt" size="sm" />
                  </button>
                  <button @click="editProvider(provider)" class="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400" title="تعديل">
                    <AppIcon name="PencilSquare" size="sm" />
                  </button>
                  <button @click="deleteProvider(provider.id)" class="text-red-600 hover:text-red-900 dark:hover:text-red-400" title="حذف">
                    <AppIcon name="Trash" size="sm" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showAddModal || showEditModal"
        class="fixed inset-0 z-[140] flex items-center justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ showEditModal ? 'تعديل المزود' : 'مزود جديد' }}
            </h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <AppIcon name="XMark" size="md" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">الاسم</label>
                <input v-model="form.name" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Google Gemini" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">النوع</label>
                <BaseSelect
                  v-model="form.provider_type"
                  select-class="form-select"
                  :options="[
                    { label: 'Google Gemini', value: 'google' },
                    { label: 'OpenRouter', value: 'openrouter' },
                    { label: 'OpenAI', value: 'openai' },
                    { label: 'Anthropic Claude', value: 'anthropic' },
                    { label: 'Mistral AI', value: 'mistral' },
                    { label: 'مخصص', value: 'custom' },
                  ]"
                />
              </div>
              <div class="space-y-2 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">مفتاح API</label>
                <input v-model="form.api_key" type="password" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="sk-..." />
              </div>
              <div class="space-y-2 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">عنوان URL الأساسي</label>
                <input v-model="form.base_url" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://api.example.com/v1" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">النموذج الافتراضي</label>
                <input v-model="form.default_model" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="gemini-1.5-flash" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">الأولوية</label>
                <input v-model.number="form.priority" type="number" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="1" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">تكلفة الإدخال/1K</label>
                <input v-model.number="form.cost_per_1k_input_tokens" type="number" step="0.0001" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.0" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">تكلفة الإخراج/1K</label>
                <input v-model.number="form.cost_per_1k_output_tokens" type="number" step="0.0001" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.0" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">الحد الأقصى للرموز</label>
                <input v-model.number="form.max_tokens" type="number" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="4096" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">درجة الإبداع (0-1)</label>
                <input v-model.number="form.temperature" type="number" step="0.1" min="0" max="1" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="0.1" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">المهلة (ثواني)</label>
                <input v-model.number="form.timeout_seconds" type="number" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="60" />
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">حد الطلبات/دقيقة</label>
                <input v-model.number="form.rate_limit_requests_per_minute" type="number" class="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="60" />
              </div>
              <div class="flex items-center gap-2 md:col-span-2">
                <input v-model="form.enabled" type="checkbox" id="enabled" class="w-4 h-4 rounded" />
                <label for="enabled" class="text-sm font-medium text-gray-700 dark:text-gray-300">مفعل</label>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              إلغاء
            </button>
            <button @click="saveProvider" :disabled="saving" class="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2">
              <BaseSpinner v-if="saving" size="xs" color="white" usage="action" />
              {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { BaseSelect, BaseSpinner } from "@/components/base";
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { aiProviderAPI } from '../../services/api';
import BaseToast from '../../components/base/BaseToast.vue';

const toast = ref(null);
const providers = ref([]);
const stats = ref({ total: 0, enabled: 0 });
const usageStats = ref({ totalCost: 0, todayRequests: 0 });
const loading = ref(false);
const saving = ref(false);
const seeding = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);

const form = ref({
  name: '',
  provider_type: 'google',
  api_key: '',
  base_url: '',
  default_model: '',
  enabled: true,
  priority: 1,
  cost_per_1k_input_tokens: 0,
  cost_per_1k_output_tokens: 0,
  max_tokens: 4096,
  temperature: 0.1,
  timeout_seconds: 60,
  rate_limit_requests_per_minute: 60,
});

const totalCost = computed(() => (usageStats.value.totalCost || 0).toFixed(4));
const todayRequests = computed(() => usageStats.value.todayRequests || 0);
const isProviderModalOpen = computed(() => showAddModal.value || showEditModal.value);

const resetForm = () => {
  form.value = {
    name: '',
    provider_type: 'google',
    api_key: '',
    base_url: '',
    default_model: '',
    enabled: true,
    priority: 1,
    cost_per_1k_input_tokens: 0,
    cost_per_1k_output_tokens: 0,
    max_tokens: 4096,
    temperature: 0.1,
    timeout_seconds: 60,
    rate_limit_requests_per_minute: 60,
  };
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  resetForm();
};

const loadProviders = async () => {
  loading.value = true;
  try {
    const res = await aiProviderAPI.getAll();
    providers.value = res.data?.data || [];
  } catch (e) {
    toast.value?.addToast({ type: 'error', message: 'خطأ في جلب المزودين' });
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const res = await aiProviderAPI.getStats();
    const data = res.data?.data || {};
    stats.value = data.providers || { total: 0, enabled: 0 };
    usageStats.value = {
      totalCost: data.usage?.totalCost || 0,
      todayRequests: data.usage?.daily?.[0]?.total_requests || 0,
    };
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
};

const saveProvider = async () => {
  saving.value = true;
  try {
    if (showEditModal.value && form.value.id) {
      await aiProviderAPI.update(form.value.id, form.value);
      toast.value?.addToast({ type: 'success', message: 'تم تحديث المزود بنجاح' });
    } else {
      await aiProviderAPI.create(form.value);
      toast.value?.addToast({ type: 'success', message: 'تم إنشاء المزود بنجاح' });
    }
    closeModal();
    await loadProviders();
    await loadStats();
  } catch (e) {
    toast.value?.addToast({ type: 'error', message: 'خطأ في حفظ المزود' });
  } finally {
    saving.value = false;
  }
};

const editProvider = (provider) => {
  form.value = { ...provider };
  showEditModal.value = true;
};

const deleteProvider = async (id) => {
  const confirmed = await window.$confirm('هل أنت متأكد من حذف هذا المزود؟');
  if (!confirmed) return;
  try {
    await aiProviderAPI.delete(id);
    toast.value?.addToast({ type: 'success', message: 'تم حذف المزود بنجاح' });
    await loadProviders();
    await loadStats();
  } catch (e) {
    toast.value?.addToast({ type: 'error', message: 'خطأ في حذف المزود' });
  }
};

const testProvider = async (id) => {
  try {
    const res = await aiProviderAPI.test(id);
    const result = res.data?.data;
    if (result?.success) {
      toast.value?.addToast({ type: 'success', message: `الاختبار ناجح (${result.latencyMs}ms)` });
    } else {
      toast.value?.addToast({ type: 'error', message: `فشل الاختبار: ${result?.error || 'غير معروف'}` });
    }
    await loadProviders();
  } catch (e) {
    toast.value?.addToast({ type: 'error', message: 'خطأ في اختبار المزود' });
  }
};

const seedDefaults = async () => {
  seeding.value = true;
  try {
    await aiProviderAPI.seedDefaults();
    toast.value?.addToast({ type: 'success', message: 'تم إضافة المزودين الافتراضيين' });
    await loadProviders();
    await loadStats();
  } catch (e) {
    toast.value?.addToast({ type: 'error', message: 'خطأ في إضافة الافتراضيات' });
  } finally {
    seeding.value = false;
  }
};

onMounted(() => {
  loadProviders();
  loadStats();
});

watch(isProviderModalOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>
