<template>
  <div class="page-shell">
    <BaseToast />
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="page-title">
          إدارة المديرين
        </h1>
        <p class="page-subtitle">
          عرض وإدارة حسابات الإدارة والمشرفين
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <input
            v-model="search"
            class="w-72 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="بحث بالاسم أو الإيميل..."
          />
        </div>
        <BaseButton
          @click="showForm = true"
          variant="primary"
          class="inline-flex items-center gap-2"
        >
          <AppIcon name="Plus" size="md" color="white" />
          إضافة مدير
        </BaseButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-layer-stats rounded-xl p-5 border border-neutral-200/70 dark:border-neutral-800/70">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-brand-50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="ShieldExclamation"
              size="xl"
              customClass="text-brand-600 dark:text-neutral-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ totalAdmins }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              إجمالي حسابات الإدارة
            </p>
          </div>
        </div>
      </div>
      <div class="bg-layer-stats rounded-xl p-5 border border-neutral-200/70 dark:border-neutral-800/70">
        <div class="flex items-center gap-4">
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

    <!-- Admin Form -->
    <div
      v-if="showForm"
      class="bg-layer-card rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 animate-fade-in-down"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-neutral-900 dark:text-white">
          {{ editingId ? "تعديل بيانات المدير" : "إضافة مدير جديد" }}
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
          placeholder="البريد الإلكتروني"
          dir="ltr"
          required
        />
        <select
          v-model="form.role"
          class="px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        >
          <option value="super_admin">مدير عام</option>
          <option value="editor">محرر</option>
          <option value="viewer">مشاهد</option>
        </select>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            كلمة المرور {{ editingId ? "(اتركها فارغة للاحتفاظ بالقديمة)" : "" }}
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              class="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 autofill:bg-transparent"
              :placeholder="editingId ? 'كلمة مرور جديدة' : 'كلمة المرور'"
              :required="!editingId"
              minlength="6"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              <AppIcon v-if="!showPassword" name="Eye" size="sm" />
              <AppIcon v-else name="EyeSlash" size="sm" />
            </button>
          </div>
        </div>
      </form>
      <div class="mt-6 flex gap-3">
        <BaseButton
          @click="saveAdmin"
          variant="primary"
          class="px-8"
        >
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
      <div class="overflow-x-auto">
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
                الصلاحية
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
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            <tr
              v-for="u in admins"
              :key="u.id"
              class="hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    <span class="text-brand-700 dark:text-brand-400 font-bold">
                      {{ u.full_name?.charAt(0) || "م" }}
                    </span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ u.full_name }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono" dir="ltr">
                {{ u.email || "-" }}
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300':
                      u.role === 'super_admin',
                    'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300':
                      u.role === 'editor',
                    'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300':
                      u.role === 'viewer',
                  }"
                >
                  {{ roleLabel(u.role) }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span
                  :class="
                    u.is_active
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                  "
                  class="text-xs px-3 py-1.5 rounded-full font-medium"
                  >{{ u.is_active ? "نشط" : "معطل" }}</span
                >
              </td>
              <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                {{ new Date(u.created_at || u.createdAt).toLocaleDateString("ar-LY") }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="editAdmin(u)"
                    class="text-brand-700 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-300 text-sm font-medium bg-brand-50 dark:bg-neutral-900/50 hover:bg-brand-100 dark:hover:bg-brand-800 px-4 py-2 min-h-[44px] rounded-lg transition-all duration-200"
                  >
                    تعديل
                  </button>
                  <button
                    @click="toggleActive(u)"
                    class="text-sm px-4 py-2 min-h-[44px] rounded-lg font-medium transition-all duration-200"
                    :class="
                      u.is_active
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 hover:text-amber-800 dark:hover:text-amber-200'
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 hover:text-emerald-800 dark:hover:text-emerald-200'
                    "
                  >
                    {{ u.is_active ? "تعطيل" : "تفعيل" }}
                  </button>
                  <button
                    @click="deleteAdmin(u.id)"
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
            لا توجد حسابات إدارة
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          عرض {{ (currentPage - 1) * pageSize + 1 }} إلى
          {{ Math.min(currentPage * pageSize, totalAdmins) }} من
          {{ totalAdmins }} مدير
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-brand-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-brand-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            صفحة {{ currentPage }} من {{ totalPages }}
          </span>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-brand-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-brand-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { adminAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseButton, BaseToast } from "@/components/base";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";

const admins = ref([]);
const search = ref("");
const showForm = ref(false);
const editingId = ref(null);
const showPassword = ref(false);

const form = ref({
  full_name: "",
  email: "",
  role: "editor",
  password: "",
});

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);
const totalAdmins = ref(0);
const totalPages = ref(1);

const activeCount = computed(
  () => admins.value.filter((adminItem) => adminItem.is_active).length,
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
    totalAdmins.value = response.data?.meta?.total || 0;
    totalPages.value = response.data?.meta?.pages || 1;
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

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadAdmins();
  }
};

const toggleActive = async (adminItem) => {
  try {
    await adminAPI.toggleAdminActive(adminItem.id);
    adminItem.is_active = !adminItem.is_active;
  } catch (error) {
    window.$toast.error("خطأ في تحديث حالة المدير");
  }
};

const deleteAdmin = async (id) => {
  const confirmed = await window.$confirm("هل أنت متأكد من حذف هذا المدير؟");
  if (!confirmed) return;
  try {
    await adminAPI.deleteAdmin(id);
    loadAdmins();
  } catch (error) {
    window.$toast.error("خطأ في حذف المدير");
  }
};

const editAdmin = (adminItem) => {
  editingId.value = adminItem.id;
  form.value = {
    full_name: adminItem.full_name || "",
    email: adminItem.email || "",
    role: adminItem.role || "editor",
    password: "",
  };
  showPassword.value = false;
  showForm.value = true;
};

const saveAdmin = async () => {
  if (!form.value.full_name || !form.value.email) {
    window.$toast.error("يرجى إكمال الحقول المطلوبة");
    return;
  }

  try {
    const payload = {
      full_name: form.value.full_name,
      email: form.value.email,
      role: form.value.role,
    };

    if (form.value.password) {
      payload.password = form.value.password;
    }

    if (editingId.value) {
      await adminAPI.updateAdmin(editingId.value, payload);
    } else {
      if (!form.value.password) {
        window.$toast.error("يرجى إدخال كلمة المرور");
        return;
      }
      await adminAPI.createAdmin(payload);
    }
    
    resetForm();
    await applyAdminFilters();

    window.$toast.success(
      editingId.value
        ? "تم تحديث بيانات المدير بنجاح"
        : "تم إضافة المدير بنجاح"
    );
  } catch (e) {
    const msg = e.response?.data?.message || "خطأ في الحفظ";
    window.$toast.error(msg);
  }
};

const resetForm = () => {
  editingId.value = null;
  showPassword.value = false;
  form.value = {
    full_name: "",
    email: "",
    role: "editor",
    password: "",
  };
  showForm.value = false;
};

const roleLabel = (r) =>
  ({ super_admin: "مدير عام", editor: "محرر", viewer: "مشاهد" })[r] || r;
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
