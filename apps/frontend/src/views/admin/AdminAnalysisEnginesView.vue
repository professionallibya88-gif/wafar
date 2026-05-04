<template>
  <div class="page-shell space-y-6">


    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="page-title">محركات التحليل الذكي</h1>
        <p class="page-subtitle">
          تحكم كامل في محركات تحليل ملفات PDF ومزودي الذكاء الاصطناعي والبدائل التلقائية
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <BaseButton variant="secondary" :disabled="loading" @click="refreshAll">
          <BaseSpinner v-if="loading" size="sm" usage="action" />
          <AppIcon v-else name="ArrowPath" size="md" />
          تحديث
        </BaseButton>
        <BaseButton variant="secondary" @click="openBulkPanel = !openBulkPanel">
          <AppIcon name="ListBullet" size="md" />
          إجراءات جماعية
        </BaseButton>
        <BaseButton @click="goToSettings">
          <AppIcon name="Cog6Tooth" size="md" />
          إعدادات المعالجة
        </BaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p class="text-sm text-neutral-500 dark:text-neutral-400">إجمالي المحركات</p>
        <p class="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">{{ engines.length }}</p>
      </div>
      <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p class="text-sm text-neutral-500 dark:text-neutral-400">المفعل</p>
        <p class="mt-2 text-2xl font-bold text-green-600">{{ enabledCount }}</p>
      </div>
      <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p class="text-sm text-neutral-500 dark:text-neutral-400">الطريقة الافتراضية</p>
        <p class="mt-2 text-lg font-bold text-neutral-900 dark:text-white">{{ methodLabel(settings.pdf_processing.default_pdf_method) }}</p>
      </div>
      <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p class="text-sm text-neutral-500 dark:text-neutral-400">طلبات اليوم</p>
        <p class="mt-2 text-2xl font-bold text-brand-600">{{ usageStats.todayRequests }}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div class="lg:col-span-2">
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">بحث</label>
          <input
            v-model="filters.q"
            class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            placeholder="اسم المحرك أو المزود أو النموذج"
          />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">النوع</label>
          <BaseSelect
  v-model="filters.type"
  select-class="form-select"
  :options="[
    { label: 'الكل', value: '' },
    { label: 'محركات PDF', value: 'pdf' },
    { label: 'مزودو AI', value: 'ai' },
  ]"
/>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">الحالة</label>
          <BaseSelect
  v-model="filters.status"
  select-class="form-select"
  :options="[
    { label: 'الكل', value: '' },
    { label: 'مفعلة', value: 'enabled' },
    { label: 'معطلة', value: 'disabled' },
  ]"
/>
        </div>
        <div class="flex items-end gap-3">
          <BaseButton class="flex-1" variant="secondary" @click="resetFilters">
            <AppIcon name="XMark" size="md" />
            مسح
          </BaseButton>
        </div>
      </div>
    </div>

    <div
      v-if="openBulkPanel && selectedIds.length"
      class="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 dark:border-neutral-700 dark:bg-neutral-900/70"
    >
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p class="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          تم تحديد {{ selectedIds.length }} عنصر
        </p>
        <div class="flex flex-wrap gap-2">
          <BaseButton size="sm" variant="secondary" @click="bulkToggle(true)">تفعيل</BaseButton>
          <BaseButton size="sm" variant="secondary" @click="bulkToggle(false)">تعطيل</BaseButton>
          <BaseButton size="sm" variant="secondary" @click="bulkTest">اختبار المحدد</BaseButton>
          <BaseButton size="sm" variant="secondary" @click="selectedIds = []">إلغاء التحديد</BaseButton>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div class="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">قائمة المحركات</h2>
        <BaseDropdown
          v-model="noopSelection"
          :items="columnOptions"
          placeholder="الأعمدة"
          searchable
          variant="primary"
          @change="toggleColumn"
        />
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[1000px]">
          <thead class="bg-neutral-50 dark:bg-neutral-950">
            <tr>
              <th class="px-4 py-3 text-right">
                <input type="checkbox" :checked="allSelected" @change="toggleAll" />
              </th>
              <th v-if="isColumnVisible('name')" class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">المحرك</th>
              <th v-if="isColumnVisible('type')" class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">النوع</th>
              <th v-if="isColumnVisible('status')" class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">الحالة</th>
              <th v-if="isColumnVisible('priority')" class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">الأولوية</th>
              <th v-if="isColumnVisible('usage')" class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">الاستخدام</th>
              <th v-if="isColumnVisible('health')" class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">الصحة</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-neutral-500">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <tr v-if="loading">
              <td colspan="8" class="px-4 py-12 text-center text-sm text-neutral-500">جاري التحميل...</td>
            </tr>
            <tr
              v-for="engine in filteredEngines"
              :key="engine.id"
              class="hover:bg-neutral-50 dark:hover:bg-neutral-950/50"
            >
              <td class="px-4 py-4">
                <input type="checkbox" :checked="selectedIds.includes(engine.id)" @change="toggleSelection(engine.id)" />
              </td>
              <td v-if="isColumnVisible('name')" class="px-4 py-4">
                <div>
                  <p class="font-semibold text-neutral-900 dark:text-white">{{ engine.name }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ engine.subtitle }}</p>
                </div>
              </td>
              <td v-if="isColumnVisible('type')" class="px-4 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                {{ engine.kind === 'pdf' ? 'محرك PDF' : 'مزود AI' }}
              </td>
              <td v-if="isColumnVisible('status')" class="px-4 py-4">
                <BaseBadge :variant="engine.enabled ? 'success' : 'error'" size="sm">
                  {{ engine.enabled ? 'مفعل' : 'معطل' }}
                </BaseBadge>
              </td>
              <td v-if="isColumnVisible('priority')" class="px-4 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                {{ engine.priority }}
              </td>
              <td v-if="isColumnVisible('usage')" class="px-4 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                {{ engine.usageLabel }}
              </td>
              <td v-if="isColumnVisible('health')" class="px-4 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                {{ engine.healthLabel }}
              </td>
              <td class="px-4 py-4">
                <div class="flex flex-wrap gap-2">
                  <BaseButton size="sm" variant="secondary" @click="openDrawer(engine)">تفاصيل</BaseButton>
                  <BaseButton size="sm" variant="secondary" @click="testEngine(engine)">اختبار</BaseButton>
                  <BaseButton
                    v-if="engine.kind === 'ai'"
                    size="sm"
                    variant="secondary"
                    @click="quickToggleProvider(engine)"
                  >
                    {{ engine.enabled ? 'تعطيل' : 'تفعيل' }}
                  </BaseButton>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && filteredEngines.length === 0">
              <td colspan="8" class="px-4 py-12 text-center text-sm text-neutral-500">لا توجد نتائج مطابقة</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">سياسة المعالجة الحالية</h3>
        <div class="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
          <p>الطريقة الافتراضية: {{ methodLabel(settings.pdf_processing.default_pdf_method) }}</p>
          <p>محرك الجداول: {{ settings.pdf_processing.python_table_engine_default || "auto" }}</p>
          <p>سلسلة البدائل: {{ settings.pdf_processing.pdf_fallback_chain || "-" }}</p>
          <p>AI للبيانات الوصفية: {{ boolLabel(settings.pdf_processing.pdf_enable_ai_metadata) }}</p>
          <p>AI لتحسين النتائج: {{ boolLabel(settings.pdf_processing.pdf_enable_ai_enrichment) }}</p>
        </div>
      </div>
      <div class="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">ملخص الاستخدام</h3>
        <div class="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
          <p>إجمالي التكلفة: ${{ totalCost }}</p>
          <p>الطلبات اليومية: {{ usageStats.todayRequests }}</p>
          <p>المزود المفضل: {{ settings.ai_providers.ai_preferred_provider || "-" }}</p>
          <p>Fallback للمزودين: {{ boolLabel(settings.ai_providers.ai_fallback_enabled) }}</p>
        </div>
      </div>
    </div>

    <BaseDrawer
      v-model:show="showDrawer"
      :title="activeEngine?.name || 'تفاصيل المحرك'"
      :description="activeEngine?.subtitle || ''"
      size="lg"
    >
      <div v-if="activeEngine" class="space-y-5">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
            <p class="text-xs text-neutral-500 dark:text-neutral-400">النوع</p>
            <p class="mt-2 font-semibold text-neutral-900 dark:text-white">
              {{ activeEngine.kind === "pdf" ? "محرك PDF" : "مزود ذكاء اصطناعي" }}
            </p>
          </div>
          <div class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
            <p class="text-xs text-neutral-500 dark:text-neutral-400">الحالة</p>
            <p class="mt-2 font-semibold text-neutral-900 dark:text-white">{{ activeEngine.healthLabel }}</p>
          </div>
          <div class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
            <p class="text-xs text-neutral-500 dark:text-neutral-400">الأولوية</p>
            <p class="mt-2 font-semibold text-neutral-900 dark:text-white">{{ activeEngine.priority }}</p>
          </div>
          <div class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
            <p class="text-xs text-neutral-500 dark:text-neutral-400">الاستخدام</p>
            <p class="mt-2 font-semibold text-neutral-900 dark:text-white">{{ activeEngine.usageLabel }}</p>
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <h4 class="text-sm font-semibold text-neutral-900 dark:text-white">آخر السجلات</h4>
          <div class="mt-3 space-y-3" v-if="activeEngine.logs?.length">
            <div
              v-for="log in activeEngine.logs"
              :key="log.id"
              class="rounded-xl bg-neutral-50 px-4 py-3 text-sm dark:bg-neutral-800"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="font-medium text-neutral-900 dark:text-white">{{ log.operation || "عملية" }}</span>
                <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ log.status }}</span>
              </div>
              <p class="mt-1 text-neutral-600 dark:text-neutral-300">
                {{ log.error_message || `زمن الاستجابة: ${log.latency_ms || 0}ms` }}
              </p>
            </div>
          </div>
          <p v-else class="mt-3 text-sm text-neutral-500">لا توجد سجلات متاحة حالياً.</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="showDrawer = false">إغلاق</BaseButton>
          <BaseButton v-if="activeEngine" @click="testEngine(activeEngine)">اختبار الآن</BaseButton>
        </div>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { aiProviderAPI, pdfAPI, settingsAPI } from "@/services/api";
import { BaseBadge, BaseButton, BaseDrawer, BaseDropdown,  BaseSelect, BaseSpinner } from "@/components/base";
import { AppIcon } from "@/components/icons";

const router = useRouter();
const toast = ref(null);
const loading = ref(false);
const openBulkPanel = ref(true);
const showDrawer = ref(false);
const activeEngine = ref(null);
const noopSelection = ref(null);

const selectedIds = ref([]);
const providers = ref([]);
const methodHealth = ref({});
const usageStats = ref({ todayRequests: 0, totalCost: 0 });
const providerLogs = ref({});
const settings = ref({
  pdf_processing: {},
  ai_providers: {},
});

const filters = ref({
  q: "",
  type: "",
  status: "",
});

const columns = ref([
  { key: "name", label: "المحرك", visible: true },
  { key: "type", label: "النوع", visible: true },
  { key: "status", label: "الحالة", visible: true },
  { key: "priority", label: "الأولوية", visible: true },
  { key: "usage", label: "الاستخدام", visible: true },
  { key: "health", label: "الصحة", visible: true },
]);

const methodDefinitions = [
  { id: "python_pypdf", name: "Python PyPDF", subtitle: "استخراج نصي محلي", priority: 1 },
  { id: "python_ai", name: "Python AI", subtitle: "تحليل ذكي محسن", priority: 2 },
  { id: "node_pdf", name: "Node PDF", subtitle: "محرك محلي من الخادم", priority: 3 },
  { id: "aws_textract", name: "AWS Textract", subtitle: "تحليل سحابي", priority: 4 },
  { id: "ocr", name: "OCR", subtitle: "احتياطي للملفات المصورة", priority: 5 },
];

const boolLabel = (value) => (String(value) === "true" || value === true ? "مفعل" : "معطل");

const methodLabel = (value) =>
  ({
    python_pypdf: "Python PyPDF",
    python_ai: "Python AI",
    node_pdf: "Node PDF",
    aws_textract: "AWS Textract",
    ocr: "OCR",
  })[value] || value || "-";

const columnOptions = computed(() =>
  columns.value.map((column) => ({
    label: `${column.visible ? "إخفاء" : "إظهار"} ${column.label}`,
    value: column.key,
  }))
);

const engines = computed(() => {
  const pdfEngines = methodDefinitions.map((method) => ({
    id: `pdf:${method.id}`,
    kind: "pdf",
    engineId: method.id,
    name: method.name,
    subtitle: method.subtitle,
    enabled: methodHealth.value?.[method.id] !== false,
    priority: method.priority,
    usageLabel:
      settings.value.pdf_processing.default_pdf_method === method.id ? "افتراضي" : "متاح",
    healthLabel:
      methodHealth.value?.default_method === method.id
        ? "افتراضي"
        : methodHealth.value?.[method.id] === false
          ? "غير جاهز"
          : "جاهز",
    logs: [],
  }));

  const aiEngines = providers.value.map((provider) => ({
    id: `ai:${provider.id}`,
    kind: "ai",
    engineId: provider.id,
    name: provider.name,
    subtitle: provider.default_model || provider.provider_type,
    enabled: Boolean(provider.enabled),
    priority: provider.priority || 0,
    usageLabel: `نجاح ${provider.success_count || 0} / فشل ${provider.failure_count || 0}`,
    healthLabel: provider.last_health_status || (provider.enabled ? "نشط" : "معطل"),
    provider,
    logs: providerLogs.value[provider.id] || [],
  }));

    return [...pdfEngines, ...aiEngines];
});

const filteredEngines = computed(() =>
  engines.value.filter((engine) => {
    const matchesQuery =
      !filters.value.q ||
      `${engine.name} ${engine.subtitle}`.toLowerCase().includes(filters.value.q.toLowerCase());
    const matchesType = !filters.value.type || engine.kind === filters.value.type;
    const matchesStatus =
      !filters.value.status ||
      (filters.value.status === "enabled" ? engine.enabled : !engine.enabled);

    return matchesQuery && matchesType && matchesStatus;
  })
);

const enabledCount = computed(() => engines.value.filter((engine) => engine.enabled).length);
const totalCost = computed(() => Number(usageStats.value.totalCost || 0).toFixed(4));
const allSelected = computed(
  () => filteredEngines.value.length > 0 && selectedIds.value.length === filteredEngines.value.length
);

const refreshAll = async () => {
  loading.value = true;
  try {
    const [providersRes, statsRes, healthRes, settingsRes] = await Promise.all([
      aiProviderAPI.getAll(),
      aiProviderAPI.getStats(),
      pdfAPI.healthCheck(),
      settingsAPI.getAll(),
    ]);

    providers.value = providersRes.data?.data || [];
    usageStats.value = {
      todayRequests: statsRes.data?.data?.usage?.daily?.[0]?.total_requests || 0,
      totalCost: statsRes.data?.data?.usage?.totalCost || 0,
    };
    methodHealth.value = healthRes.data?.data || {};
    settings.value = settingsRes.data?.data || { pdf_processing: {}, ai_providers: {} };

    await Promise.all(
      providers.value.slice(0, 3).map(async (provider) => {
        try {
          const logsRes = await aiProviderAPI.getLogs(provider.id, { limit: 5 });
          providerLogs.value[provider.id] = logsRes.data?.data || [];
        } catch {
          providerLogs.value[provider.id] = [];
        }
      })
    );
  } catch (error) {
    toast.value?.addToast({ type: "error", message: "تعذر تحميل بيانات المحركات" });
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = { q: "", type: "", status: "" };
};

const toggleColumn = (item) => {
  const target = columns.value.find((column) => column.key === item.value);
  if (target) {
    target.visible = !target.visible;
  }
};

const isColumnVisible = (key) => columns.value.find((column) => column.key === key)?.visible !== false;

const toggleSelection = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
};

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = filteredEngines.value.map((engine) => engine.id);
  }
};

const openDrawer = (engine) => {
  activeEngine.value = engine;
  showDrawer.value = true;
};

const testEngine = async (engine) => {
  try {
    if (engine.kind === "ai") {
      const res = await aiProviderAPI.test(engine.engineId);
      const ok = res.data?.data?.success;
      toast.value?.addToast({
        type: ok ? "success" : "error",
        message: ok ? "تم اختبار المزود بنجاح" : "فشل اختبار المزود",
      });
    } else {
      toast.value?.addToast({
        type: "success",
        message: `فحص ${engine.name}: ${engine.healthLabel}`,
      });
    }
    await refreshAll();
  } catch {
    toast.value?.addToast({ type: "error", message: "تعذر تنفيذ الاختبار" });
  }
};

const quickToggleProvider = async (engine) => {
  try {
    await aiProviderAPI.update(engine.engineId, {
      ...engine.provider,
      enabled: !engine.provider.enabled,
    });
    toast.value?.addToast({
      type: "success",
      message: engine.provider.enabled ? "تم تعطيل المزود" : "تم تفعيل المزود",
    });
    await refreshAll();
  } catch {
    toast.value?.addToast({ type: "error", message: "تعذر تحديث حالة المزود" });
  }
};

const bulkToggle = async (enabled) => {
  const aiTargets = engines.value.filter(
    (engine) => selectedIds.value.includes(engine.id) && engine.kind === "ai"
  );

  if (!aiTargets.length) {
    toast.value?.addToast({ type: "info", message: "العمليات الجماعية متاحة حالياً لمزودي AI فقط" });
    return;
  }

  try {
    await Promise.all(
      aiTargets.map((engine) =>
        aiProviderAPI.update(engine.engineId, {
          ...engine.provider,
          enabled,
        })
      )
    );
    toast.value?.addToast({
      type: "success",
      message: enabled ? "تم تفعيل المزودين المحددين" : "تم تعطيل المزودين المحددين",
    });
    await refreshAll();
  } catch {
    toast.value?.addToast({ type: "error", message: "تعذر تنفيذ العملية الجماعية" });
  }
};

const bulkTest = async () => {
  try {
    const aiTargets = engines.value.filter(
      (engine) => selectedIds.value.includes(engine.id) && engine.kind === "ai"
    );
    await Promise.all(aiTargets.map((engine) => aiProviderAPI.test(engine.engineId)));
    toast.value?.addToast({ type: "success", message: "تم تنفيذ الاختبار على العناصر المحددة" });
    await refreshAll();
  } catch {
    toast.value?.addToast({ type: "error", message: "تعذر تنفيذ الاختبار الجماعي" });
  }
};

const goToSettings = () => {
  router.push("/admin/settings");
};

onMounted(() => {
  refreshAll();
});
</script>
