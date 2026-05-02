<template>
  <div class="w-full">
    <!-- Header -->
    <div class="text-center mb-6 pt-0 flex flex-col items-center">
      <img
        v-if="siteSettings?.site_logo"
        :src="siteSettings.site_logo"
        class="w-16 h-16 object-contain mb-4"
        :alt="siteSettings?.site_name || 'وفر'"
      />
      <div
        v-else
        class="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-brand-sm mb-4"
      >
        <AppIcon name="DocumentText" size="lg" color="white" />
      </div>
      <h1 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">
        تسجيل دخول الإدارة
      </h1>
      <p class="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 transition-colors">
        الرجاء إدخال بيانات الاعتماد للوصول إلى لوحة التحكم
      </p>
    </div>

    <!-- Error Message -->
    <Transition name="slide-fade">
      <div
        v-if="authStore.error"
        class="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 transition-colors dark:border-red-500/20 dark:bg-red-500/10"
      >
        <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
          <AppIcon name="ExclamationCircle" size="sm" class="text-red-600 dark:text-red-400" />
        </div>
        <p class="text-sm text-red-700 dark:text-red-400">
          {{ authStore.error }}
        </p>
      </div>
    </Transition>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Email/Phone Input -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
          البريد الإلكتروني أو رقم الهاتف
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
            <AppIcon name="User" size="sm" />
          </div>
          <input
            v-model="email"
            type="text"
            required
            dir="ltr"
            class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-12 pl-4 text-left text-base font-sans transition-all duration-200 placeholder:text-neutral-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
            placeholder="admin@example.com / 091XXXXXXX"
          />
        </div>
      </div>

      <!-- Password Input -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
          كلمة المرور
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
            <AppIcon name="Lock" size="sm" />
          </div>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            dir="ltr"
            class="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pr-12 pl-12 text-left text-base tracking-widest font-sans transition-all duration-200 placeholder:text-neutral-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
            placeholder="••••••••"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 left-0 flex items-center px-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <AppIcon v-if="!showPassword" name="Eye" size="sm" />
            <AppIcon v-else name="EyeSlash" size="sm" />
          </button>
        </div>
      </div>

      <!-- Remember Me -->
      <div class="checkbox-inline">
        <input
          id="remember"
          type="checkbox"
          v-model="rememberMe"
          class="h-5 w-5 rounded border-neutral-300 bg-white text-brand-600 transition-colors focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-brand-500/30"
        />
        <label
          for="remember"
          class="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer select-none transition-colors"
        >
          تذكرني
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="authStore.loading"
        class="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-200 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <AppIcon v-if="authStore.loading" name="Refresh" size="sm" customClass="animate-spin" />
        <span>{{ authStore.loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول للإدارة' }}</span>
      </button>
    </form>

    <div class="mt-6 border-t border-neutral-200 pt-5 text-center dark:border-neutral-700">
      <router-link
        to="/login"
        class="text-sm text-neutral-500 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400 transition-colors"
      >
        العودة لتسجيل دخول المستخدمين
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AppIcon } from "@/components/icons";
import { getPostAdminAuthRedirect } from "@/utils/authRedirect";
import { useSiteSettings } from "@/composables/useSiteSettings";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { siteSettings } = useSiteSettings();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);

const handleLogin = async () => {
  const success = await authStore.adminLogin(
    email.value,
    password.value,
    rememberMe.value,
  );
  if (success) {
    router.push(getPostAdminAuthRedirect(route.query.redirect));
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
  transform: translateY(-10px);
  opacity: 0;
}
</style>
