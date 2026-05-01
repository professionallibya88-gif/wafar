<template>
  <div class="w-full">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">
        إنشاء حساب
      </h1>
      <p class="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 transition-colors">
        انضم إلى وفر واستفد من مزايا البحث الذكي لقطع الغيار
      </p>
    </div>

    <!-- Error Message -->
    <Transition name="slide-fade">
      <div
        v-if="validationError || authStore.error"
        class="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 transition-colors"
      >
        <div class="w-8 h-8 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <AppIcon name="ExclamationCircle" size="sm" class="text-red-600 dark:text-red-400" />
        </div>
        <p class="text-sm text-red-700 dark:text-red-400">
          {{ validationError || authStore.error }}
        </p>
      </div>
    </Transition>

    <!-- Register Form -->
    <form @submit.prevent="handleRegister" class="space-y-5">
      <!-- Full Name Input -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
          الاسم الرباعي
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
            <AppIcon name="User" size="sm" />
          </div>
          <input
            v-model="fullName"
            type="text"
            required
            class="w-full pr-12 pl-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 placeholder:text-neutral-400 text-left dark:text-white text-base"
            placeholder="أدخل اسمك الرباعي"
          />
        </div>
      </div>

      <!-- Phone Input -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
          رقم الهاتف
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
            <AppIcon name="Phone" size="sm" />
          </div>
          <input
            v-model="phone"
            type="tel"
            required
            dir="ltr"
            class="w-full pr-12 pl-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 placeholder:text-neutral-400 text-left dark:text-white text-base"
            placeholder="091XXXXXXX"
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
            class="w-full pr-12 pl-12 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 placeholder:text-neutral-400 dark:text-white text-base"
            placeholder="6 أحرف على الأقل"
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
        <!-- Password Strength Indicator -->
        <div class="mt-2">
          <div class="flex gap-1">
            <div
              v-for="i in 4"
              :key="i"
              class="h-1 flex-1 rounded-full transition-colors"
              :class="passwordStrength >= i ? strengthColors[passwordStrength] : 'bg-neutral-200 dark:bg-neutral-700'"
            />
          </div>
          <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {{ strengthLabels[passwordStrength] }}
          </p>
        </div>
      </div>

      <!-- Confirm Password Input -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
          تأكيد كلمة المرور
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
            <AppIcon name="ShieldCheck" size="sm" />
          </div>
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            required
            :class="[
              'w-full pr-12 pl-4 py-3 bg-white dark:bg-neutral-800 border rounded-xl transition-all duration-200 text-base dark:text-white',
              confirmPassword && password !== confirmPassword
                ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                : 'border-neutral-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10',
            ]"
            placeholder="أعد كتابة كلمة المرور"
          />
        </div>
        <p v-if="confirmPassword && password !== confirmPassword" class="mt-1 text-xs text-red-600 dark:text-red-400">
          كلمتا المرور غير متطابقتين
        </p>
      </div>

      <!-- Terms Checkbox -->
      <div class="flex items-center gap-3">
        <input
          id="terms"
          type="checkbox"
          v-model="acceptTerms"
          required
          class="w-5 h-5 text-brand-600 bg-white border-neutral-300 rounded focus:ring-brand-500 dark:bg-neutral-800 dark:border-neutral-600 dark:focus:ring-brand-500/30 transition-colors"
        />
        <label for="terms" class="text-sm text-neutral-600 dark:text-neutral-400 transition-colors">
          أوافق على
          <span class="text-brand-600 dark:text-brand-400 font-medium cursor-pointer">الشروط والأحكام</span>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="authStore.loading || !acceptTerms"
        class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
      >
        <AppIcon v-if="authStore.loading" name="Refresh" size="sm" customClass="animate-spin" />
        <span>{{ authStore.loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب' }}</span>
      </button>
    </form>

    <!-- Login Link -->
    <div class="mt-8 text-center">
      <p class="text-sm text-neutral-500 dark:text-neutral-400 transition-colors">
        لديك حساب بالفعل؟
        <router-link
          :to="loginLink"
          class="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold transition-colors"
        >
          تسجيل الدخول
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { AppIcon } from "@/components/icons";
import { getPostAuthRedirect } from "@/utils/authRedirect";
import { normalizePhoneNumber } from "@/utils/phone";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const fullName = ref("");
const phone = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const acceptTerms = ref(false);
const validationError = ref("");

const loginLink = computed(() => ({
  path: "/login",
  query: route.query.redirect ? { redirect: route.query.redirect } : {},
}));

const passwordStrength = computed(() => {
  if (!password.value) return 0;
  let strength = 0;
  if (password.value.length >= 6) strength++;
  if (password.value.length >= 8) strength++;
  if (/[A-Z]/.test(password.value)) strength++;
  if (/[0-9]/.test(password.value)) strength++;
  if (/[^A-Za-z0-9]/.test(password.value)) strength++;
  return Math.min(strength, 4);
});

const strengthColors = {
  0: "bg-neutral-200 dark:bg-neutral-700",
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-green-500",
};

const strengthLabels = {
  0: "",
  1: "كلمة المرور ضعيفة",
  2: "كلمة المرور متوسطة",
  3: "كلمة المرور قوية",
  4: "كلمة المرور قوية جداً",
};

const handleRegister = async () => {
  validationError.value = "";
  const normalizedPhone = normalizePhoneNumber(phone.value);

  const phoneRegex = /^09[0-9]{8}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    validationError.value = "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام";
    return;
  }

  if (password.value !== confirmPassword.value) {
    validationError.value = "كلمتا المرور غير متطابقتين";
    return;
  }

  if (password.value.length < 6) {
    validationError.value = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    return;
  }

  const success = await authStore.register(
    fullName.value,
    normalizedPhone,
    password.value,
    confirmPassword.value,
  );
  if (success) {
    router.push(getPostAuthRedirect(authStore, route.query.redirect));
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
