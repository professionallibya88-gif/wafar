<template>
  <div class="page-shell max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
      <div
        class="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center shadow-brand-sm"
      >
        <AppIcon name="UserCircle" size="lg" color="white" />
      </div>
      <div>
        <h1
          class="text-2xl xs:text-3xl font-bold text-neutral-900 dark:text-neutral-100"
        >
          الملف الشخصي
        </h1>
        <p class="text-neutral-500 dark:text-neutral-400 text-sm">
          إدارة بياناتك الشخصية وكلمة المرور
        </p>
      </div>
    </div>

    <!-- Profile Info Card -->
    <div class="panel-card overflow-hidden">
      <!-- Profile Header Banner -->
      <div class="h-24 bg-brand-700 relative">
        <div class="absolute -bottom-10 right-6 group cursor-pointer" @click="triggerAvatarUpload">
          <div
            v-if="authStore.user?.avatar_url"
            class="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-neutral-900 overflow-hidden relative"
          >
            <img :src="authStore.user.avatar_url" alt="Avatar" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <AppIcon name="Camera" size="sm" color="white" />
            </div>
          </div>
          <div
            v-else
            class="w-20 h-20 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white dark:border-neutral-900 relative overflow-hidden"
          >
            {{ authStore.user?.full_name?.charAt(0) || "م" }}
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <AppIcon name="Camera" size="sm" color="white" />
            </div>
          </div>
          <input
            type="file"
            ref="avatarInput"
            class="hidden"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            @change="handleAvatarUpload"
          />
        </div>
      </div>

      <div class="pt-14 pb-6 px-6">
        <!-- User Info Row -->
        <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2
              class="text-xl font-bold text-neutral-900 dark:text-neutral-100"
            >
              {{ authStore.user?.full_name || "مستخدم" }}
            </h2>
            <p
              class="text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-1"
            >
              <AppIcon name="Phone" size="sm" />
              {{ authStore.user?.phone || "غير محدد" }}
            </p>
          </div>
          <BaseBadge
            :variant="roleBadgeVariant"
            size="md"
          >
            {{ roleLabel }}
          </BaseBadge>
        </div>

        <!-- Profile Form -->
        <form @submit.prevent="updateProfile" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label
                class="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
              >
                <AppIcon name="User" size="sm" class="inline ml-1" />
                الاسم الثلاثي
              </label>
              <input
                v-model="form.full_name"
                type="text"
                class="w-full px-4 py-3 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:bg-white dark:focus:bg-neutral-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-200 dark:focus:ring-brand-900/30 transition-all duration-200"
                placeholder="أدخل اسمك الثلاثي"
              />
            </div>

            <div>
              <label
                class="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
              >
                <AppIcon name="Envelope" size="sm" class="inline ml-1" />
                رقم الهاتف
              </label>
              <input
                :value="authStore.user?.phone || 'غير محدد'"
                type="text"
                disabled
                class="w-full px-4 py-3 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label
                class="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
              >
                <AppIcon name="UserCircle" size="sm" class="inline ml-1" />
                 إعداد الحساب
              </label>
              <input
                :value="roleLabel"
                type="text"
                disabled
                class="w-full px-4 py-3 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div class="pt-2">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="updating"
              class="w-full sm:w-auto"
            >
              <template #iconLeft>
                <AppIcon name="Check" size="sm" />
              </template>
              حفظ التغييرات
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Password Card -->
    <div class="panel-card overflow-hidden">
      <div class="p-6 lg:p-8">
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 bg-warning-500 rounded-xl flex items-center justify-center"
          >
            <AppIcon name="LockClosed" size="md" color="white" />
          </div>
          <div>
            <h3
              class="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
            >
              تغيير كلمة المرور
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              قم بتحديث كلمة المرور الخاصة بك
            </p>
          </div>
        </div>

        <form @submit.prevent="changePassword" class="space-y-5">
          <div>
            <label
              class="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
            >
              <AppIcon name="Key" size="sm" class="inline ml-1" />
              كلمة المرور الحالية
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-500 dark:text-neutral-400"
              >
                <AppIcon name="LockClosed" size="sm" />
              </div>
              <input
                v-model="passwordForm.current_password"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="w-full pr-12 pl-12 py-3 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:bg-white dark:focus:bg-neutral-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-200 dark:focus:ring-brand-900/30 transition-all duration-200"
                placeholder="أدخل كلمة المرور الحالية"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute inset-y-0 left-0 flex items-center px-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-600 transition-colors"
              >
                <AppIcon
                  :name="showCurrentPassword ? 'EyeSlash' : 'Eye'"
                  size="sm"
                />
              </button>
            </div>
          </div>

          <div>
            <label
              class="block text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2"
            >
              <AppIcon name="LockOpen" size="sm" class="inline ml-1" />
              كلمة المرور الجديدة
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-500 dark:text-neutral-400"
              >
                <AppIcon name="LockOpen" size="sm" />
              </div>
              <input
                v-model="passwordForm.new_password"
                :type="showNewPassword ? 'text' : 'password'"
                class="w-full pr-12 pl-12 py-3 bg-brand-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:bg-white dark:focus:bg-neutral-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-200 dark:focus:ring-brand-900/30 transition-all duration-200"
                placeholder="أدخل كلمة المرور الجديدة"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute inset-y-0 left-0 flex items-center px-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-600 transition-colors"
              >
                <AppIcon
                  :name="showNewPassword ? 'EyeSlash' : 'Eye'"
                  size="sm"
                />
              </button>
            </div>
            <!-- Password Strength -->
            <div class="mt-3">
              <div class="flex gap-1.5">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1.5 flex-1 rounded-full transition-all duration-300"
                  :class="
                    passwordStrength >= i
                      ? strengthColors[passwordStrength]
                      : 'bg-neutral-200 dark:bg-neutral-700'
                  "
                />
              </div>
              <div class="flex items-center justify-between mt-1.5">
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ strengthLabels[passwordStrength] }}
                </p>
                <div
                  class="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400"
                >
                  <AppIcon name="InformationCircle" size="xs" />
                  <span>6 أحرف على الأقل</span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2">
            <BaseButton
              type="submit"
              variant="secondary"
              :loading="changingPassword"
              class="w-full sm:w-auto"
            >
              <template #iconLeft>
                <AppIcon name="ArrowPath" size="sm" />
              </template>
              تغيير كلمة المرور
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Account Stats Card -->
    <div class="panel-card overflow-hidden p-6">
      <h3
        class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2"
      >
        <AppIcon name="ChartBar" size="md" class="text-brand-500" />
        إحصائيات الحساب
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-if="isEnabled('upload') || isEnabled('files')"
          class="bg-brand-50 dark:bg-neutral-800 rounded-xl p-4 text-center"
        >
          <p class="text-2xl font-bold text-brand-700 dark:text-neutral-300">
            {{ userStats.files || 0 }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            ملفات PDF
          </p>
        </div>
        <div
          v-if="isEnabled('search') || isEnabled('history')"
          class="bg-brand-50 dark:bg-neutral-800 rounded-xl p-4 text-center"
        >
          <p class="text-2xl font-bold text-brand-700 dark:text-neutral-300">
            {{ userStats.searches || 0 }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            عمليات البحث
          </p>
        </div>
        <div
          v-if="isEnabled('subscriptions')"
          class="bg-brand-50 dark:bg-neutral-800 rounded-xl p-4 text-center"
        >
          <p class="text-2xl font-bold text-brand-700 dark:text-neutral-300">
            {{ userStats.subscriptions || 0 }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            اشتراكات
          </p>
        </div>
        <div
          v-if="isEnabled('payments')"
          class="bg-brand-50 dark:bg-neutral-800 rounded-xl p-4 text-center"
        >
          <p class="text-2xl font-bold text-brand-700 dark:text-neutral-300">
            {{ userStats.payments || 0 }}
          </p>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            مدفوعات
          </p>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <Transition name="slide-fade">
      <div
        v-if="message"
        :class="[
          'fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-lg flex items-center gap-3 z-50 max-w-[90vw]',
          messageType === 'success'
            ? 'bg-success-50 dark:bg-success-900/30 border border-success-200 dark:border-success-800 text-success-700 dark:text-success-400'
            : 'bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-400',
        ]"
      >
        <div
          v-if="messageType === 'success'"
          class="w-8 h-8 bg-success-100 dark:bg-success-900/50 rounded-lg flex items-center justify-center"
        >
          <AppIcon
            name="Check"
            size="sm"
            class="text-success-600 dark:text-success-400"
          />
        </div>
        <div
          v-else
          class="w-8 h-8 bg-error-100 dark:bg-error-900/50 rounded-lg flex items-center justify-center"
        >
          <AppIcon
            name="XMark"
            size="sm"
            class="text-error-600 dark:text-error-400"
          />
        </div>
        <p class="text-sm font-medium">{{ message }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { userAPI } from "@/services/api";
import { BaseButton, BaseBadge } from "@/components/base";
import { AppIcon } from "@/components/icons";
import { useFeatureFlags } from "@/composables/useFeatureFlags";
import { getUserRoleBadgeVariant } from "@/utils/roleLabels";

const authStore = useAuthStore();
const { isEnabled } = useFeatureFlags();
const form = ref({ full_name: authStore.user?.full_name || "" });
const passwordForm = ref({ current_password: "", new_password: "" });
const message = ref("");
const messageType = ref("success");
const updating = ref(false);
const changingPassword = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const avatarInput = ref(null);

// User stats (these would come from API in production)
const userStats = ref({
  files: 0,
  searches: 0,
  subscriptions: 1,
  payments: 0,
});

const roleLabel = computed(() => authStore.userRoleLabel);
const roleBadgeVariant = computed(() =>
  getUserRoleBadgeVariant(authStore.userRole),
);

// Password Strength
const passwordStrength = computed(() => {
  if (!passwordForm.value.new_password) return 0;
  let strength = 0;
  if (passwordForm.value.new_password.length >= 6) strength++;
  if (passwordForm.value.new_password.length >= 8) strength++;
  if (/[A-Z]/.test(passwordForm.value.new_password)) strength++;
  if (/[0-9]/.test(passwordForm.value.new_password)) strength++;
  if (/[^A-Za-z0-9]/.test(passwordForm.value.new_password)) strength++;
  return Math.min(strength, 4);
});

const strengthColors = {
  1: "bg-error-500",
  2: "bg-warning-500",
  3: "bg-warning-400",
  4: "bg-success-500",
};

const strengthLabels = {
  0: "",
  1: "كلمة المرور ضعيفة",
  2: "كلمة المرور متوسطة",
  3: "كلمة المرور قوية",
  4: "كلمة المرور قوية جدا",
};

const showMessage = (text, type = "success") => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
  }, 3000);
};

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    showMessage("جاري رفع الصورة...", "success");
    await userAPI.uploadAvatar(formData);
    await authStore.fetchProfile();
    showMessage("تم تحديث الصورة الشخصية بنجاح");
  } catch (e) {
    showMessage("خطأ في رفع الصورة", "error");
  } finally {
    event.target.value = ""; // Reset input
  }
};

const updateProfile = async () => {
  updating.value = true;
  try {
    await userAPI.updateProfile({ full_name: form.value.full_name });
    await authStore.fetchProfile();
    showMessage("تم تحديث البيانات بنجاح");
  } catch (e) {
    showMessage("خطأ في التحديث", "error");
  } finally {
    updating.value = false;
  }
};

const changePassword = async () => {
  changingPassword.value = true;
  try {
    await userAPI.changePassword(passwordForm.value);
    showMessage("تم تغيير كلمة المرور بنجاح");
    passwordForm.value = { current_password: "", new_password: "" };
  } catch (e) {
    showMessage(e.response?.data?.message || "خطأ", "error");
  } finally {
    changingPassword.value = false;
  }
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
