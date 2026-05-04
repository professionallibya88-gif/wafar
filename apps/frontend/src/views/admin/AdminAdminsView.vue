<template>
  <div class="page-shell">
    
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="page-title">
          إدارة المديرين
        </h1>
        <p class="page-subtitle">
          عرض وإدارة جميع حسابات مدراء النظام
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-auto">
          <input
            v-model="search"
            class="w-full sm:w-72 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="بحث بالاسم، الهاتف، أو البريد..."
          />
        </div>
        <BaseButton
          @click="openAddForm"
          variant="primary"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          <AppIcon name="Plus" size="md" color="white" />
          إضافة مدير
        </BaseButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-layer-stats rounded-xl p-5 border border-neutral-200/70 dark:border-neutral-800/70">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div
            class="w-12 h-12 bg-brand-50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="ShieldCheck"
              size="xl"
              customClass="text-brand-600 dark:text-neutral-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ totalAdmins }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              إجمالي المديرين
            </p>
          </div>
        </div>
      </div>
      <div class="bg-layer-stats rounded-xl p-5 border border-neutral-200/70 dark:border-neutral-800/70">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div
            class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="CheckCircle"
              size="xl"
              customClass="text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ activeCount }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              المديرين النشطين
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form Card -->
    <div
      v-if="showForm"
      class="bg-layer-form rounded-2xl p-6 lg:p-8 animate-fadeIn border border-neutral-200 dark:border-neutral-800"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {{ editingId ? "تعديل بيانات" : "إضافة" }} مدير
        </h2>
        <button
          @click="resetForm"
          class="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <AppIcon name="XMark" size="md" />
        </button>
      </div>

      <form @submit.prevent="saveAdmin" autocomplete="off" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          v-model="form.full_name"
          autocomplete="new-password"
          class="px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 autofill:bg-transparent"
          placeholder="الاسم الكامل"
          required
        />
        <input
          v-model="form.email"
          type="email"
          autocomplete="new-password"
          class="px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 autofill:bg-transparent"
          placeholder="البريد الإلكتروني (اختياري إذا تم إدخال رقم الهاتف)"
          dir="ltr"
        />
        <input
          v-model="form.phone"
          type="tel"
          autocomplete="new-password"
          class="px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 autofill:bg-transparent"
          placeholder="رقم الهاتف (اختياري إذا تم إدخال البريد)"
          dir="ltr"
        />
        
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 autofill:bg-transparent pl-12"
            :placeholder="editingId ? 'اترك الحقل فارغاً إذا لم ترغب بتغيير كلمة المرور' : 'كلمة المرور'"
            :required="!editingId"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            title="عرض/إخفاء كلمة المرور"
          >
            <AppIcon :name="showPassword ? 'EyeSlash' : 'Eye'" size="sm" />
          </button>
        </div>
      </form>
      <div class="flex gap-3 mt-6">
        <BaseButton
          @click="saveAdmin"
          variant="primary"
          class="inline-flex items-center gap-2"
        >
          <AppIcon name="Check" size="sm" color="white" />
          حفظ
        </BaseButton>
        <BaseButton
          @click="resetForm"
          variant="secondary"
        >
          إلغاء
        </BaseButton>
      </div>
    </div>

    <!-- Admins Table Card -->
    <div class="panel-table mt-6">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <BasePagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="totalAdmins" :totalPages="totalPages" />
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-brand-50 dark:bg-gray-900">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                المدير
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                البريد الإلكتروني
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
                تاريخ التسجيل
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
              v-for="admin in admins"
              :key="admin.id"
              class="hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-500 rounded-full flex items-center justify-center text-white font-semibold"
                  >
                    {{ admin.full_name?.charAt(0) || "م" }}
                  </div>
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                    >{{ admin.full_name }}</span
                  >
                </div>
              </td>
              <td
                class="px-4 py-4 text-sm text-brand-700 dark:text-gray-300"
                dir="ltr"
              >
                {{ admin.email }}
              </td>
              <td
                class="px-4 py-4 text-sm text-gray-600 dark:text-gray-400"
                dir="ltr"
              >
                {{ admin.phone || "-" }}
              </td>
              <td class="px-4 py-4">
                <span
                  :class="
                    admin.is_active
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                  "
                  class="text-xs px-3 py-1.5 rounded-full font-medium"
                  >{{ admin.is_active ? "نشط" : "معطل" }}</span
                >
              </td>
              <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                {{ new Date(admin.created_at || admin.createdAt).toLocaleDateString("ar-LY") }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="editAdmin(admin)"
                    class="text-brand-700 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-300 text-sm font-medium bg-brand-50 dark:bg-neutral-900/50 hover:bg-brand-100 dark:hover:bg-brand-800 px-4 py-2 min-h-[44px] rounded-lg transition-all duration-200"
                  >
                    تعديل
                  </button>
                  <button
                    @click="toggleActive(admin)"
                    class="text-sm px-4 py-2 min-h-[44px] rounded-lg font-medium transition-all duration-200"
                    :class="
                      admin.is_active
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 hover:text-amber-800 dark:hover:text-amber-200'
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 hover:text-emerald-800 dark:hover:text-emerald-200'
                    "
                  >
                    {{ admin.is_active ? "تعطيل" : "تفعيل" }}
                  </button>
                  <button
                    @click="deleteAdmin(admin.id)"
                    class="text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm font-medium bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 px-4 py-2 min-h-[44px] rounded-lg transition-all duration-200"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="admins.length === 0" class="text-center py-16">
          <AppIcon
            name="ShieldExclamation"
            size="3xl"
            customClass="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">
            لا يوجد مدراء
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <BasePagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="totalAdmins" :totalPages="totalPages" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { adminAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseButton,  BasePagination } from "@/components/base";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";

const admins = ref([]);
const search = ref("");
const showForm = ref(false);
const editingId = ref(null);
const showPassword = ref(false);

const form = ref({
  full_name: "",
  email: "",
  phone: "",
  password: "",
});

// Pagination
const currentPage = ref(1);
watch(currentPage, () => { loadAdmins(); });
const pageSize = ref(20);
const totalAdmins = ref(0);
const totalPages = ref(1);

watch(pageSize, () => {
  currentPage.value = 1;
  loadAdmins();
});

const activeCount = computed(
  () => admins.value.filter((a) => a.is_active).length,
);

const loadAdmins = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    if (search.value) params.search = search.value;
    const response = await adminAPI.getAdmins(params);
    admins.value = response.data?.data?.admins || [];
    totalAdmins.value = response.data?.meta?.total || response.data?.data?.total || 0;
    totalPages.value = response.data?.meta?.totalPages || response.data?.data?.totalPages || 1;
  } catch (error) { /* ignore */ }
};

onMounted(() => loadAdmins());

const { applyNow: applyAdminFilters } = useAutoApplyFilters(
  () => [search.value],
  loadAdmins,
  {
    delay: 450,
    resetPage: () => {
      currentPage.value = 1;
    },
  },
);

const toggleActive = async (adminItem) => {
  try {
    await adminAPI.toggleAdminActive(adminItem.id);
    adminItem.is_active = !adminItem.is_active;
  } catch (error) {
    window.$toast.error(error.response?.data?.message || "خطأ في تحديث حالة المدير");
  }
};

const deleteAdmin = async (id) => {
  const confirmed = await window.$confirm?.("هل أنت متأكد من حذف هذا المدير؟") || window.confirm("هل أنت متأكد من حذف هذا المدير؟");
  if (!confirmed) return;
  try {
    await adminAPI.deleteAdmin(id);
    loadAdmins();
    window.$toast.success("تم حذف المدير بنجاح");
  } catch (error) {
    window.$toast.error(error.response?.data?.message || "خطأ في حذف المدير");
  }
};

const openAddForm = () => {
  resetForm();
  showForm.value = true;
};

const editAdmin = (adminItem) => {
  editingId.value = adminItem.id;
  form.value = {
    full_name: adminItem.full_name || "",
    email: adminItem.email || "",
    phone: adminItem.phone || "",
    password: "",
  };
  showPassword.value = false;
  showForm.value = true;
};

const saveAdmin = async () => {
  if (!form.value.full_name) {
    window.$toast.error("يرجى إدخال الاسم الكامل");
    return;
  }

  if (!form.value.email && !form.value.phone) {
    window.$toast.error("يرجى إدخال البريد الإلكتروني أو رقم الهاتف على الأقل");
    return;
  }

  if (!editingId.value && !form.value.password) {
    window.$toast.error("يرجى إدخال كلمة المرور للحساب الجديد");
    return;
  }

  try {
    const payload = { ...form.value };
    if (!payload.email) delete payload.email;
    if (!payload.phone) delete payload.phone;

    if (editingId.value && !payload.password) {
      delete payload.password;
    }

    if (editingId.value) {
      await adminAPI.updateAdmin(editingId.value, payload);
    } else {
      await adminAPI.createAdmin(payload);
    }
    
    resetForm();
    await applyAdminFilters();

    window.$toast.success(
      editingId.value
        ? "تم تحديث بيانات المدير بنجاح"
        : "تم إضافة المدير بنجاح"
    );
  } catch (error) {
    const message = error.response?.data?.message || "خطأ في الحفظ";
    window.$toast.error(message);
  }
};

const resetForm = () => {
  editingId.value = null;
  showPassword.value = false;
  form.value = {
    full_name: "",
    email: "",
    phone: "",
    password: "",
  };
  showForm.value = false;
};
</script>

<style scoped>
/* Fix browser autofill background in dark mode */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active {
  -webkit-background-clip: text;
  -webkit-text-fill-color: inherit;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
