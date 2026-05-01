<template>
  <div class="w-full">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2 transition-colors">
        استعادة كلمة المرور
      </h1>
      <p class="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 transition-colors">
        تحقق برمز مؤقت ثم عين كلمة مرور جديدة بأمان
      </p>
    </div>

    <div class="mb-6 flex items-center justify-between gap-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 px-4 py-3 text-sm transition-colors">
      <div class="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
        <AppIcon name="ShieldCheck" size="sm" />
        <span>{{ stepLabels[step - 1] }}</span>
      </div>
      <span class="rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 px-2.5 py-1 text-xs font-semibold transition-colors">
        الخطوة {{ step }} من 3
      </span>
    </div>

    <!-- Messages -->
    <Transition name="slide-fade">
      <div
        v-if="message"
        class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-colors border"
        :class="
          messageType === 'success'
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400'
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
        "
      >
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="messageType === 'success' ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20'"
        >
          <AppIcon
            :name="messageType === 'success' ? 'CheckCircle' : 'ExclamationCircle'"
            size="sm"
            :class="messageType === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
          />
        </div>
        <p class="text-sm font-medium">
          {{ message }}
        </p>
      </div>
    </Transition>

    <div
      v-if="debugOtp"
      class="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10 text-sm text-amber-800 dark:text-amber-400 transition-colors"
    >
      رمز التحقيق الحالي:
      <span class="font-bold tracking-[0.3em]" dir="ltr">{{ debugOtp }}</span>
    </div>

    <!-- Step 1: Request OTP -->
    <form v-if="step === 1" @submit.prevent="requestOtp" class="space-y-5">
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

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
      >
        <AppIcon v-if="loading" name="Refresh" size="sm" customClass="animate-spin" />
        <span>{{ loading ? 'جاري إرسال الرمز...' : 'إرسال رمز التحقق' }}</span>
      </button>
    </form>

    <!-- Step 2: Verify OTP -->
    <form v-else-if="step === 2" @submit.prevent="verifyOtp" class="space-y-5">
      <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-4 text-sm text-neutral-600 dark:text-neutral-300 transition-colors">
        أدخل الرمز المكون من 6 أرقام الذي تم إرساله إلى الرقم
        <span class="font-semibold text-neutral-900 dark:text-white" dir="ltr">{{ phone }}</span>
      </div>

      <div class="space-y-2">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
          رمز التحقق
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
            <AppIcon name="ShieldCheck" size="sm" />
          </div>
          <input
            v-model="otp"
            type="text"
            required
            inputmode="numeric"
            maxlength="6"
            dir="ltr"
            class="w-full pr-12 pl-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 placeholder:text-neutral-400 text-left dark:text-white tracking-[0.35em] text-lg font-medium"
            placeholder="123456"
          />
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          @click="step = 1"
          class="w-full py-3.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-base"
        >
          تغيير الرقم
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
        >
          <AppIcon v-if="loading" name="Refresh" size="sm" customClass="animate-spin" />
          <span>{{ loading ? 'جاري التحقق...' : 'تحقق من الرمز' }}</span>
        </button>
      </div>
    </form>

    <!-- Step 3: Complete Reset -->
    <form v-else @submit.prevent="completeReset" class="space-y-5">
      <div class="space-y-2">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
          كلمة المرور الجديدة
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
            <AppIcon name="Lock" size="sm" />
          </div>
          <input
            v-model="newPassword"
            type="password"
            required
            class="w-full pr-12 pl-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 placeholder:text-neutral-400 dark:text-white text-base"
            placeholder="6 أحرف على الأقل"
          />
        </div>
      </div>

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
            type="password"
            required
            class="w-full pr-12 pl-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:bg-white dark:focus:bg-neutral-800 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200 placeholder:text-neutral-400 dark:text-white text-base"
            placeholder="أعد كتابة كلمة المرور"
          />
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          @click="step = 2"
          class="w-full py-3.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-base"
        >
          رجوع
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
        >
          <AppIcon v-if="loading" name="Refresh" size="sm" customClass="animate-spin" />
          <span>{{ loading ? 'جاري التغيير...' : 'تأكيد التغيير' }}</span>
        </button>
      </div>
    </form>

    <!-- Back to Login -->
    <div class="mt-8 text-center">
      <router-link
        to="/login"
        class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium inline-flex items-center gap-1 group transition-colors"
      >
        <AppIcon name="ChevronRight" size="sm" customClass="group-hover:-translate-x-1 transition-transform" />
        العودة لتسجيل الدخول
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { normalizePhoneNumber } from "@/utils/phone";

const router = useRouter();

const step = ref(1);
const phone = ref("");
const otp = ref("");
const resetToken = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const message = ref("");
const messageType = ref("success");
const debugOtp = ref("");

const stepLabels = [
  "طلب رمز التحقق",
  "التحقق من الرمز",
  "تعيين كلمة المرور الجديدة",
];

const setMessage = (text, type = "success") => {
  message.value = text;
  messageType.value = type;
};

const requestOtp = async () => {
  loading.value = true;
  setMessage("");
  const normalizedPhone = normalizePhoneNumber(phone.value);

  try {
    const response = await authAPI.requestPasswordResetOtp({
      phone: normalizedPhone,
    });
    phone.value = normalizedPhone;
    debugOtp.value = response.data?.data?.debug_otp || "";
    setMessage(
      response.data?.message ||
        "إذا كان رقم الهاتف مسجلاً فستتم إرسال رمز التحقق إليك",
    );
    step.value = 2;
  } catch (error) {
    setMessage(
      error.response?.data?.message ||
        "تعذر إرسال رمز التحقق",
      "error",
    );
  } finally {
    loading.value = false;
  }
};

const verifyOtp = async () => {
  loading.value = true;
  setMessage("");
  const normalizedPhone = normalizePhoneNumber(phone.value);

  try {
    const response = await authAPI.verifyPasswordResetOtp({
      phone: normalizedPhone,
      otp: otp.value,
    });
    phone.value = normalizedPhone;
    resetToken.value = response.data?.data?.reset_token || "";
    setMessage(
      "تم التحقق من الرمز بنجاح. يمكنك الآن إدخال كلمة المرور الجديدة",
    );
    step.value = 3;
  } catch (error) {
    setMessage(
      error.response?.data?.message || "تعذر التحقق من الرمز",
      "error",
    );
  } finally {
    loading.value = false;
  }
};

const completeReset = async () => {
  loading.value = true;
  setMessage("");
  const normalizedPhone = normalizePhoneNumber(phone.value);

  if (newPassword.value !== confirmPassword.value) {
    setMessage("كلمتا المرور غير متطابقتين", "error");
    loading.value = false;
    return;
  }

  try {
    await authAPI.completePasswordReset({
      phone: normalizedPhone,
      reset_token: resetToken.value,
      new_password: newPassword.value,
      confirm_password: confirmPassword.value,
    });
    phone.value = normalizedPhone;
    setMessage(
      "تم تغيير كلمة المرور بنجاح. سيتم تحويلك إلى صفحة تسجيل الدخول",
    );
    setTimeout(() => router.push("/login"), 1200);
  } catch (error) {
    setMessage(
      error.response?.data?.message ||
        "تعذر تغيير كلمة المرور",
      "error",
    );
  } finally {
    loading.value = false;
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
