<template>
  <div
    class="auth-layout-shell min-h-screen min-h-[100dvh] flex bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7ff_45%,#eef4ff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0b1120_48%,#020617_100%)] transition-colors duration-300"
  >
    <div class="relative flex flex-1 items-start justify-center overflow-y-auto px-3 pt-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:items-center sm:p-5 md:p-6">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 auth-form-grid opacity-70 dark:opacity-30" />
        <div class="absolute top-[-12rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-brand-400/18 blur-3xl dark:bg-brand-500/16" />
        <div class="absolute bottom-[-12rem] left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-sky-300/22 blur-3xl dark:bg-sky-500/12" />
      </div>

      <div class="relative z-10 w-full max-w-md xl:max-w-lg">
        <div
          class="rounded-[1.75rem] border border-white/70 bg-white/78 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-6 md:p-7 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_32px_90px_rgba(2,6,23,0.58)]"
        >
          <router-view v-slot="{ Component, route }">
            <PageTransition v-bind="transitionProps">
              <component :is="Component" :key="route.fullPath" />
            </PageTransition>
          </router-view>
        </div>
      </div>
    </div>

    <AuthVisualPanel />
  </div>
</template>

<script setup>
import { usePageTransition } from "@/composables/usePageTransition";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel.vue";
import { PageTransition } from "@/components/transitions";

const { transitionProps } = usePageTransition();
</script>

<style scoped>
.auth-form-grid {
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(circle at center, black 38%, transparent 92%);
}

@media (prefers-reduced-motion: reduce) {
  .auth-layout-shell {
    transition-duration: 120ms;
  }
}
</style>
