<template>
  <div class="w-full">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-brand-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-brand-500/30">
        <AppIcon name="ShieldCheck" size="xl" class="text-white" />
      </div>
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">
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
        class="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 transition-colors"
      >
        <div class="w-8 h-8 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <AppIcon name="ExclamationCircle" size="sm" class="text-red-600 dark:text-red-400" />
        </div>
        <p class="text-sm text-red-700 dark:text-red-400">
          {{ authStore.error }}
        </p>
      </div>
    </Transition>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-5">
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
            class="w-full pr-12 pl-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 placeholder:text-neutral-400 text-left dark:text-white text-base font-sans"
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
            class="w-full pr-12 pl-12 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 placeholder:text-neutral-400 text-left tracking-widest dark:text-white text-base font-sans"
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
      <div class="flex items-center gap-3">
        <div class="relative flex items-center">
          <input
            id="remember"
            type="checkbox"
            v-model="rememberMe"
            class="w-5 h-5 text-brand-600 bg-white border-neutral-300 rounded focus:ring-brand-500 dark:bg-neutral-800 dark:border-neutral-600 dark:focus:ring-brand-500/30 transition-colors"
          />
        </div>
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
        class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base mt-2"
      >
        <AppIcon v-if="authStore.loading" name="Refresh" size="sm" customClass="animate-spin" />
        <span>{{ authStore.loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول للإدارة' }}</span>
      </button>
    </form>

    <div class="mt-8 text-center border-t border-neutral-200 dark:border-neutral-700 pt-6">
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

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

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
