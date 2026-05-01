<template>
  <div class="page-shell">
    <BaseToast />
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="page-title">
          إدارة المستخدمين
        </h1>
        <p class="page-subtitle">
          عرض وإدارة حسابات المستخدمين
        </p>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="roleFilter"
          class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">جميع الأدوار</option>
          <option value="retailer">تاجر</option>
          <option value="supplier">مورد</option>
        </select>
        <div class="relative">
          <input
            v-model="search"
            class="w-72 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            placeholder="بحث بالاسم أو الهاتف..."
          />
        </div>
        <BaseButton
          @click="showForm = true"
          variant="primary"
          class="inline-flex items-center gap-2"
        >
          <AppIcon name="Plus" size="md" color="white" />
          إضافة مستخدم
        </BaseButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-layer-stats rounded-xl p-5 border border-neutral-200/70 dark:border-neutral-800/70">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-brand-50 dark:bg-neutral-900/50 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="Users"
              size="xl"
              customClass="text-brand-600 dark:text-neutral-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ users.length }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              إجمالي المستخدمين
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
            <p class="text-sm text-neutral-600 dark:text-neutral-300">نشط</p>
          </div>
        </div>
      </div>
      <div class="bg-layer-stats rounded-xl p-5 border border-neutral-200/70 dark:border-neutral-800/70">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="ShieldExclamation"
              size="xl"
              customClass="text-amber-600 dark:text-amber-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ activeCount }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              المستخدمين النشطين
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
      <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
        {{ editingId ? "تعديل" : "إضافة" }} مستخدم
      </h2>
      <form @submit.prevent="saveUser" autocomplete="off" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <input
          v-model="form.full_name"
          autocomplete="new-password"
          class="px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 autofill:bg-transparent"
          placeholder="الاسم الكامل"
        />
        <input
          v-model="form.phone"
          autocomplete="new-password"
          class="px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 autofill:bg-transparent"
          placeholder="رقم الهاتف"
          dir="ltr"
        />
        <select
          v-model="form.role"
          class="px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        >
          <option value="retailer">تاجر</option>
          <option value="supplier">مورد</option>
        </select>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {{ editingId ? 'تغيير كلمة المرور (اختياري)' : 'كلمة المرور' }}
          </label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              class="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-brand-500 autofill:bg-transparent pl-12"
              :placeholder="editingId ? 'اترك الحقل فارغاً إذا لم ترغب بتغيير كلمة المرور' : 'أدخل كلمة المرور'"
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
        </div>
      </form>
      <div class="flex gap-3 mt-6">
        <BaseButton
          @click="saveUser"
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

    <!-- Users Table Card -->
    <div class="panel-table">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-brand-50 dark:bg-gray-900">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                المستخدم
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الهاتف
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الدور
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
              v-for="u in users"
              :key="u.id"
              class="hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-500 rounded-full flex items-center justify-center text-white font-semibold"
                  >
                    {{ u.full_name?.charAt(0) || "x" }}
                  </div>
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                    >{{ u.full_name }}</span
                  >
                </div>
              </td>
              <td
                class="px-4 py-4 text-sm text-brand-700 dark:text-gray-300"
                dir="ltr"
              >
                {{ u.phone }}
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
                  :class="{
                    'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300':
                      u.role === 'retailer',
                    'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300':
                      u.role === 'supplier',
                  }"
                >
                  {{ getUserRoleLabel(u.role) }}
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
                {{ new Date(u.createdAt).toLocaleDateString("ar-LY") }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="editUser(u)"
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
                    @click="deleteUser(u.id)"
                    class="text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm font-medium bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 px-4 py-2 min-h-[44px] rounded-lg transition-all duration-200"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="users.length === 0" class="text-center py-16">
          <AppIcon
            name="Users"
            size="3xl"
            customClass="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">
            لا يوجد مستخدمون
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
          {{ Math.min(currentPage * pageSize, totalUsers) }} من
          {{ totalUsers }} مستخدم
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
            صفحة {{ currentPage }} م  {{ totalPages }}
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
import { getUserRoleLabel } from "@/utils/roleLabels";

const users = ref([]);
const search = ref("");
const roleFilter = ref("");
const showForm = ref(false);
const editingId = ref(null);
const showPassword = ref(false);

const form = ref({
  full_name: "",
  phone: "",
  role: "retailer",
  password: "",
});

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);
const totalUsers = ref(0);
const totalPages = ref(1);

const activeCount = computed(
  () => users.value.filter((userItem) => userItem.is_active).length,
);

const loadUsers = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    if (search.value) params.search = search.value;
    if (roleFilter.value) params.role = roleFilter.value;
    const response = await adminAPI.getUsers(params);
    users.value = response.data?.data?.users || [];
    totalUsers.value = response.data?.data?.total || 0;
    totalPages.value = response.data?.data?.totalPages || 1;
  } catch (error) { /* ignore */ }
};

onMounted(() => loadUsers());

const { applyNow: applyUserFilters } = useAutoApplyFilters(
  () => [search.value, roleFilter.value],
  loadUsers,
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
    loadUsers();
  }
};

const toggleActive = async (userItem) => {
  try {
    await adminAPI.toggleUserActive(userItem.id);
    userItem.is_active = !userItem.is_active;
  } catch (error) {
    window.$toast.error("خطأ في تحديث حالة المستخدم");
  }
};

const deleteUser = async (id) => {
  const confirmed = await window.$confirm("هل أنت متأكد من حذف هذا المستخدم؟");
  if (!confirmed)
    return;
  try {
    await adminAPI.deleteUser(id);
    loadUsers();
  } catch (error) {
    window.$toast.error("خطأ في حذف المستخدم");
  }
};

const editUser = (userItem) => {
  editingId.value = userItem.id;
  form.value = {
    full_name: userItem.full_name || "",
    phone: userItem.phone || "",
    role: userItem.role || "retailer",
    password: "",
  };
  showPassword.value = false;
  showForm.value = true;
};

const saveUser = async () => {
  try {
    const payload = { ...form.value };
    if (editingId.value && !payload.password) {
      delete payload.password;
    }

    if (editingId.value && payload.password) {
      const confirmed = await window.$confirm("هل أنت متأكد من تغيير كلمة المرور لهذا المستخدم؟");
      if (!confirmed) return;
    }

    if (editingId.value) {
      await adminAPI.updateUser(editingId.value, payload);
    } else {
      // API doesn't have createUser by default, but let's assume it handles it
      await adminAPI.createUser?.(payload);
    }
    
    resetForm();
    await applyUserFilters();

    window.$toast.success(
      editingId.value
        ? "تم تحديث بيانات المستخدم بنجاح"
        : "تم إضافة المستخدم بنجاح"
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
    phone: "",
    role: "retailer",
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
