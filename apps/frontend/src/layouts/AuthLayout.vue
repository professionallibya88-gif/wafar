<template>
  <div class="min-h-screen flex bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
    <!-- Right Side - Form Content (Active View) -->
    <div class="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10 overflow-y-auto">
      <div class="w-full max-w-md animate-fade-in-up">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>

    <!-- Left Side - Illustration / Branding -->
    <div class="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-brand-700 z-0">
      <CinematicBackground v-if="isDarkMode" />
      <div v-else class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-brand-500 rounded-full opacity-20 blur-3xl animate-float" />
        <div class="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] bg-brand-500 rounded-full opacity-20 blur-3xl animate-float" style="animation-delay: -2s" />
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-400 rounded-full opacity-20 blur-3xl animate-float" style="animation-delay: -4s" />
      </div>

      <!-- Brand Content -->
      <div class="relative z-10 text-white text-center max-w-lg px-8 animate-fade-in-up">
        <div class="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-3xl mx-auto mb-6 md:mb-8 flex items-center justify-center border border-white/20 shadow-xl overflow-hidden">
          <img v-if="siteSettings?.site_logo" :src="siteSettings.site_logo" class="w-full h-full object-contain" />
          <AppIcon v-else name="Globe" size="2xl" class="md:!w-10 md:!h-10" color="white" />
        </div>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {{ siteSettings?.site_name ? `بوابة ${siteSettings.site_name}` : 'بوابة وفر' }}
        </h2>
        <p class="text-base md:text-xl text-brand-100 leading-relaxed mb-8">
          {{ siteSettings?.site_description || 'نظام فلترة ذكي للبحث عن مئات آلاف قطع الغيار ومقارنة الأسعار من الموردين الموثوقين' }}
        </p>

        <!-- Features -->
        <div class="space-y-4 text-right">
          <div class="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transition-transform hover:scale-105">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AppIcon name="DocumentText" size="lg" />
            </div>
            <div>
              <p class="font-bold text-lg">معالجة PDF ذكية</p>
              <p class="text-sm text-brand-200">استخراج دقيق للبيانات بالذكاء الاصطناعي</p>
            </div>
          </div>
          <div class="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transition-transform hover:scale-105">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AppIcon name="ChartBar" size="lg" />
            </div>
            <div>
              <p class="font-bold text-lg">مقارنة الأسعار</p>
              <p class="text-sm text-brand-200">ابحث عن أفضل الأسعار بسرعة وسهولة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { AppIcon } from '@/components/icons';
import { useSiteSettings } from '@/composables/useSiteSettings';
import CinematicBackground from '@/components/CinematicBackground.vue';
import { useThemeStore } from '@/stores/theme';

const { siteSettings } = useSiteSettings();
const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.isDark());
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
