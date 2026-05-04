<template>
  <div class="space-y-8">
    <BaseToast />
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          إدارة الشركات الموردة
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          إضافة وتعديل بيانات الموردين
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <BaseSelect
  v-model="categoryFilter"
  select-class="form-select"
  :options="[
    { label: 'جميع الفئات', value: '' },
    { label: 'قطع الغيار سيارات', value: 'automotive' },
    { label: 'أدوية', value: 'pharmaceutical' },
    { label: 'صناعي', value: 'industrial' },
    { label: 'أخرى', value: 'other' },
  ]"
/>
        <div class="relative">
          <input
            v-model="search"
            class="w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="بحث..."
          />
        </div>
        <button
          @click="showForm = true"
          class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-primary-500/30"
        >
          <AppIcon name="Plus" size="md" color="white" />
          إضافة شركة
        </button>
      </div>
    </div>

    <!-- Add/Edit Form Card -->
    <div
      v-if="showForm"
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 animate-fadeIn"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {{ editingId ? "تعديل" : "إضافة" }} شركة
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          v-model="form.name"
          class="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
          placeholder="اسم الشركة"
        />
        <input
          v-model="form.phone"
          class="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
          placeholder="رقم الهاتف"
          dir="ltr"
        />
        <input
          v-model="form.email"
          class="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
          placeholder="البريد الإلكتروني"
          dir="ltr"
        />
        <BaseSelect
  v-model="form.category"
  select-class="form-select"
  :options="[
    { label: 'قطع الغيار سيارات', value: 'automotive' },
    { label: 'أدوية', value: 'pharmaceutical' },
    { label: 'صناعي', value: 'industrial' },
    { label: 'أخرى', value: 'other' },
  ]"
/>
        <textarea
          v-model="form.address"
          class="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 md:col-span-2 resize-none"
          rows="2"
          placeholder="العنوان"
        ></textarea>
      </div>
      <div class="flex gap-3 mt-6">
        <button
          @click="saveSupplier"
          class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium"
        >
          <AppIcon name="Check" size="sm" color="white" />
          حفظ
        </button>
        <button
          @click="resetForm"
          class="inline-flex items-center gap-2 bg-brand-50 dark:bg-gray-700 hover:bg-brand-100 dark:hover:bg-gray-600 text-brand-700 dark:text-gray-300 px-5 py-2.5 rounded-xl transition-all font-medium border border-gray-200 dark:border-gray-600"
        >
          إلغاء
        </button>
      </div>
    </div>

    <!-- Suppliers Table Card -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <BasePagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="totalSuppliers" :totalPages="totalPages" />
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الاسم
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الفئة
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الهاتف
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الحالة
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="s in suppliers"
              :key="s.id"
              class="hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <div
                    class="w-10 h-10 bg-brand-100 dark:bg-neutral-900/40 rounded-lg flex items-center justify-center"
                  >
                    <AppIcon
                      name="BuildingOffice"
                      size="lg"
                      customClass="text-brand-600 dark:text-neutral-400"
                    />
                  </div>
                  <div>
                    <span
                      class="text-sm font-medium text-gray-900 dark:text-white"
                      >{{ s.name }}</span
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ s.email || "-" }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{
                  catLabel(s.category)
                }}</span>
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300"
                dir="ltr"
              >
                {{ s.phone || "-" }}
              </td>
              <td class="px-4 py-4">
                <span
                  :class="
                    s.is_active
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                  "
                  class="text-xs px-3 py-1.5 rounded-full font-medium"
                  >{{ s.is_active ? "نشط" : "معطل" }}</span
                >
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="editSupplier(s)"
                    class="text-brand-700 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-300 text-sm bg-brand-50 dark:bg-neutral-900/50 hover:bg-brand-100 dark:hover:bg-brand-800 px-4 py-2 min-h-[44px] rounded-lg transition-colors"
                  >
                    تعديل
                  </button>
                  <button
                    @click="toggleActive(s)"
                    class="text-sm px-4 py-2 min-h-[44px] rounded-lg font-medium transition-colors"
                    :class="
                      s.is_active
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800'
                    "
                  >
                    {{ s.is_active ? "تعطيل" : "تفعيل" }}
                  </button>
                  <button
                    @click="deleteSupplier(s.id)"
                    class="text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 px-4 py-2 min-h-[44px] rounded-lg transition-colors"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="suppliers.length === 0" class="text-center py-16">
          <AppIcon
            name="BuildingOffice"
            size="3xl"
            customClass="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">
            لا توجد شركات
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <BasePagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="totalSuppliers" :totalPages="totalPages" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { adminAPI, supplierAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseToast, BaseSelect, BasePagination } from "@/components/base";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";

const suppliers = ref([]);
const showForm = ref(false);
const editingId = ref(null);
const form = ref({
  name: "",
  phone: "",
  email: "",
  address: "",
  category: "automotive",
});
const search = ref("");
const categoryFilter = ref("");

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);
const totalSuppliers = ref(0);
const totalPages = ref(1);

watch(pageSize, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    loadSuppliers();
  }
});

watch(currentPage, () => {
  loadSuppliers();
});

const loadSuppliers = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    if (search.value) params.search = search.value;
    if (categoryFilter.value) params.category = categoryFilter.value;
    const response = await supplierAPI.getAll(params);
    suppliers.value = response.data?.data?.suppliers || [];
    totalSuppliers.value = response.data?.data?.total || 0;
    totalPages.value = response.data?.data?.totalPages || 1;
  } catch (error) {
    window.$toast.error("خطأ في جلب الموردين");
  }
};

onMounted(() => loadSuppliers());

const { applyNow: applySupplierFilters } = useAutoApplyFilters(
  () => [search.value, categoryFilter.value],
  loadSuppliers,
  {
    delay: 450,
    resetPage: () => {
      currentPage.value = 1;
    },
  },
);



const editSupplier = (supplierItem) => {
  editingId.value = supplierItem.id;
  form.value = {
    name: supplierItem.name,
    phone: supplierItem.phone || "",
    email: supplierItem.email || "",
    address: supplierItem.address || "",
    category: supplierItem.category,
  };
  showForm.value = true;
};

const saveSupplier = async () => {
  try {
    if (editingId.value) {
      await adminAPI.updateSupplier(editingId.value, form.value);
    } else {
      await adminAPI.createSupplier(form.value);
    }
    resetForm();
    await applySupplierFilters();
  } catch (error) {
    window.$toast.error("خطأ في الحفظ");
  }
};

const deleteSupplier = async (id) => {
  const confirmed = await window.$confirm("هل أنت متأكد من حذف هذه الشركة؟");
  if (!confirmed)
    return;
  try {
    await adminAPI.deleteSupplier(id);
    await applySupplierFilters();
  } catch (error) {
    window.$toast.error("خطأ في الحذف");
  }
};

const toggleActive = async (supplierItem) => {
  try {
    await adminAPI.toggleSupplierActive(supplierItem.id);
    supplierItem.is_active = !supplierItem.is_active;
    window.$toast.success(
      supplierItem.is_active
        ? "تم تفعيل الشركة"
        : "تم تعطيل الشركة",
    );
  } catch (error) {
    window.$toast.error("خطأ في تحديث حالة الشركة");
  }
};

const resetForm = () => {
  showForm.value = false;
  editingId.value = null;
  form.value = {
    name: "",
    phone: "",
    email: "",
    address: "",
    category: "automotive",
  };
};

const catLabel = (c) =>
  ({
    automotive: "سيارات",
    pharmaceutical: "أدوية",
    industrial: "صناعي",
    other: "أخرى",
  })[c] || c;
</script>
