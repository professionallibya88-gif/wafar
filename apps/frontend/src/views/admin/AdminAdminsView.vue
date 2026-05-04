<template>
  <div class="page-shell">
    <BaseToast />
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="page-title">
          الحساب الإداري الأساسي
        </h1>
        <p class="page-subtitle">
          عرض وتحديث بيانات الحساب الإداري الوحيد في النظام
        </p>
      </div>
      <div
        class="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 dark:border-brand-900/60 dark:bg-brand-900/20 dark:text-brand-300"
      >
        <AppIcon name="ShieldCheck" size="sm" />
        <span>وضع الحساب الإداري الوحيد</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-layer-stats rounded-xl p-5 border border-neutral-200/70 dark:border-neutral-800/70">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
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
              {{ displayedAdminsCount }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              الحسابات الإدارية المعروضة
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
            <p
              class="text-2xl font-bold"
              :class="
                primaryAdmin?.is_active
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-red-700 dark:text-red-400'
              "
            >
              {{ primaryAdmin?.is_active ? "نشط" : "غير متوفر" }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              حالة الحساب الأساسي
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
    >
      تعرض هذه الصفحة الحساب الإداري الأساسي فقط. لا يمكن من هنا إضافة حسابات إدارية جديدة أو حذف
      الحساب أو تعطيله أو تغيير نوعه إلى أدوار متعددة.
    </div>

    <div
      v-if="showForm"
      class="bg-layer-card rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 animate-fade-in-down"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-neutral-900 dark:text-white">
          تحديث بيانات الحساب الإداري
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
          class="px-4 py-3 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
          placeholder="البريد الإلكتروني"
          dir="ltr"
          readonly
          disabled
        />
        <input
          v-model="form.phone"
          type="tel"
          class="px-4 py-3 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
          placeholder="رقم الهاتف"
          dir="ltr"
          readonly
          disabled
        />
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            كلمة المرور (ثابتة للحساب الأساسي ولا يمكن تغييرها من هنا)
          </label>
          <div class="relative">
            <input
              type="password"
              class="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
              value="******"
              readonly
              disabled
            />
          </div>
        </div>
        <div
          class="md:col-span-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-300"
        >
          نوع الحساب الإداري ثابت كحساب أساسي للنظام ولا يمكن تعديله من هذه الواجهة.
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
          إغلاق
        </BaseButton>
      </div>
    </div>

    <div v-if="primaryAdmin" class="bg-layer-card mt-6 rounded-2xl border border-neutral-200 p-6 shadow-sm dark:border-neutral-700">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex items-start gap-4">
          <div
            class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/30"
          >
            <span class="font-bold text-brand-700 dark:text-brand-300">
              {{ primaryAdmin.full_name?.charAt(0) || "م" }}
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">
                {{ primaryAdmin.full_name }}
              </h2>
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  primaryAdmin.is_active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                "
              >
                {{ primaryAdmin.is_active ? "نشط" : "معطل" }}
              </span>
              <span
                class="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              >
                حساب أساسي
              </span>
            </div>
            <p class="text-sm text-neutral-600 dark:text-neutral-300">
              هذا الحساب هو المرجع الإداري الوحيد المعروض في لوحة التحكم.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <BaseButton
            @click="editAdmin(primaryAdmin)"
            variant="primary"
            class="inline-flex items-center justify-center gap-2"
          >
            <AppIcon name="PencilSquare" size="sm" color="white" />
            تعديل البيانات
          </BaseButton>
          <button
            type="button"
            disabled
            class="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400 opacity-80 cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500"
          >
            الإضافة والحذف والتعطيل غير متاحة
          </button>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/30">
          <p class="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
            البريد الإلكتروني
          </p>
          <p class="font-medium text-neutral-900 dark:text-white" dir="ltr">
            {{ primaryAdmin.email || "-" }}
          </p>
        </div>
        <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/30">
          <p class="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
            رقم الهاتف
          </p>
          <p class="font-medium text-neutral-900 dark:text-white" dir="ltr">
            {{ primaryAdmin.phone || "-" }}
          </p>
        </div>
        <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/30">
          <p class="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
            نوع الحساب
          </p>
          <p class="font-medium text-neutral-900 dark:text-white">
            مدير عام أساسي
          </p>
        </div>
        <div class="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/30">
          <p class="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
            تاريخ التسجيل
          </p>
          <p class="font-medium text-neutral-900 dark:text-white">
            {{ formatDate(primaryAdmin.created_at || primaryAdmin.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="bg-layer-card mt-6 rounded-2xl border border-neutral-200 p-8 text-center shadow-sm dark:border-neutral-700">
      <AppIcon
        name="ShieldExclamation"
        size="3xl"
        customClass="mx-auto mb-4 text-gray-300 dark:text-gray-600"
      />
      <p class="text-lg font-medium text-neutral-900 dark:text-white">
        لم يتم العثور على الحساب الإداري الأساسي حالياً
      </p>
      <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        تأكد من تهيئة الحساب الإداري من جهة النظام ثم أعد المحاولة.
      </p>
      <BaseButton
        @click="loadAdmins"
        variant="secondary"
        class="mx-auto mt-6 inline-flex items-center justify-center gap-2"
      >
        <AppIcon name="ArrowPath" size="sm" />
        إعادة التحميل
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { adminAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { BaseButton, BaseToast } from "@/components/base";

const primaryAdmin = ref(null);
const showForm = ref(false);
const editingId = ref(null);
const showPassword = ref(false);

const form = ref({
  full_name: "",
  email: "",
  phone: "",
  password: "",
});

const displayedAdminsCount = computed(() => (primaryAdmin.value ? 1 : 0));

const loadAdmins = async () => {
  try {
    const response = await adminAPI.getAdmins({
      page: 1,
      limit: 1,
    });
    primaryAdmin.value = response.data?.data?.admins?.[0] || null;
  } catch (error) {
    primaryAdmin.value = null;
    window.$toast?.error("تعذر تحميل الحساب الإداري الأساسي");
  }
};

onMounted(() => loadAdmins());

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
    window.$toast.error("يرجى إدخال البريد الإلكتروني أو رقم الهاتف");
    return;
  }
  if (!editingId.value) {
    window.$toast.error("لا يمكن إنشاء حساب إداري جديد من هذه الواجهة");
    return;
  }

  try {
    const payload = {
      full_name: form.value.full_name,
      email: form.value.email,
      phone: form.value.phone,
    };

    if (form.value.password) {
      payload.password = form.value.password;
    }

    await adminAPI.updateAdmin(editingId.value, payload);
    await loadAdmins();
    resetForm();
    window.$toast.success("تم تحديث بيانات الحساب الإداري بنجاح");
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
    phone: "",
    password: "",
  };
  showForm.value = false;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("ar-LY");
};
</script>

<style scoped>
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active {
  -webkit-background-clip: text;
  -webkit-text-fill-color: inherit;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
