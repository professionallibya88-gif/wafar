<template>
  <div class="auth-visual hidden lg:flex flex-1 relative overflow-hidden isolate">
    <div class="absolute inset-0 auth-poster" />
    <CinematicBackground
      v-if="shouldRenderDynamicVisual"
      class="auth-cinematic-layer"
      :class="isVisualReady ? 'opacity-100' : 'opacity-0'"
      @ready="handleVisualReady"
    />

    <div
      class="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.28),rgba(2,6,23,0.72))]"
    />

    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 auth-noise opacity-[0.08]" />
      <div class="absolute inset-0 auth-vignette" />
      <div class="absolute top-14 left-14 h-40 w-40 rounded-full bg-sky-300/12 blur-3xl dark:bg-sky-400/10 float-slow" />
      <div class="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-brand-300/12 blur-3xl dark:bg-brand-400/12 float-slow-delayed" />
    </div>

    <div class="relative z-10 flex w-full items-end justify-start p-10 xl:p-14">
      <div class="max-w-md">
        <div
          v-if="siteSettings?.auth_visual_badge"
          class="inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs tracking-[0.2em] text-white/80 backdrop-blur-xl animate-fade-up-1 border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(2,6,23,0.45)]"
        >
          <span class="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.9)]" />
          <span>{{ siteSettings.auth_visual_badge }}</span>
        </div>

        <div class="mt-6 flex items-center gap-4 animate-fade-up-2">
          <div class="brand-mark">
            <img
              v-if="siteSettings?.site_logo"
              :src="siteSettings.site_logo"
              class="h-full w-full object-contain"
              alt=""
            />
            <AppIcon v-else name="Globe" size="xl" color="white" />
          </div>

          <div>
            <p class="text-sm tracking-[0.28em] text-white/50">WAFFAR PLATFORM</p>
            <p class="mt-1 text-lg font-semibold text-white/90">
              {{ siteSettings?.site_name || "وفر" }}
            </p>
          </div>
        </div>

        <h2 v-if="siteSettings?.auth_visual_title" class="mt-7 text-4xl xl:text-[3.25rem] font-black leading-[1.2] text-white animate-fade-up-3 whitespace-pre-line">
          {{ siteSettings.auth_visual_title }}
        </h2>

        <p v-if="siteSettings?.auth_visual_description" class="mt-5 max-w-md text-base leading-8 text-white/70 animate-fade-up-4">
          {{ siteSettings.auth_visual_description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { AppIcon } from "@/components/icons";
import CinematicBackground from "@/components/CinematicBackground.vue";
import { useSiteSettings } from "@/composables/useSiteSettings";

const { siteSettings } = useSiteSettings();
const shouldRenderDynamicVisual = ref(false);
const isVisualReady = ref(false);

const prefersReducedMotion = computed(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
});

const handleVisualReady = () => {
  isVisualReady.value = true;
};

onMounted(() => {
  if (prefersReducedMotion.value) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      shouldRenderDynamicVisual.value = true;
    });
  });
});
</script>

<style scoped>
.auth-visual {
  background: #0b1f47;
}

.auth-poster {
  background:
    radial-gradient(circle at 18% 20%, rgba(96, 165, 250, 0.22), transparent 24%),
    radial-gradient(circle at 85% 82%, rgba(59, 130, 246, 0.2), transparent 28%),
    linear-gradient(180deg, #06122b 0%, #081937 46%, #050d1e 100%);
}

.auth-cinematic-layer {
  transition: opacity 320ms ease;
}

.auth-noise {
  background-image:
    radial-gradient(rgba(255, 255, 255, 0.7) 0.7px, transparent 0.7px),
    radial-gradient(rgba(255, 255, 255, 0.3) 0.5px, transparent 0.5px);
  background-position: 0 0, 22px 18px;
  background-size: 34px 34px, 28px 28px;
}

.auth-vignette {
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent 38%),
    linear-gradient(180deg, rgba(2, 6, 23, 0.0), rgba(2, 6, 23, 0.38));
}

.brand-mark {
  display: flex;
  height: 4.25rem;
  width: 4.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.08));
  box-shadow: 0 20px 56px rgba(2, 6, 23, 0.24);
  backdrop-filter: blur(22px);
}

.animate-fade-up-1 {
  opacity: 0;
  animation: fadeUpSlow 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.08s forwards;
}

.animate-fade-up-2 {
  opacity: 0;
  animation: fadeUpSlow 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.14s forwards;
}

.animate-fade-up-3 {
  opacity: 0;
  animation: fadeUpSlow 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
}

.animate-fade-up-4 {
  opacity: 0;
  animation: fadeUpSlow 0.72s cubic-bezier(0.16, 1, 0.3, 1) 0.26s forwards;
}

.float-slow {
  animation: floatSlow 12s ease-in-out infinite;
}

.float-slow-delayed {
  animation: floatSlow 15s ease-in-out -6s infinite;
}

@keyframes fadeUpSlow {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatSlow {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-16px) scale(1.04); }
}

@media (prefers-reduced-motion: reduce) {
  .auth-cinematic-layer,
  .animate-fade-up-1,
  .animate-fade-up-2,
  .animate-fade-up-3,
  .animate-fade-up-4,
  .float-slow,
  .float-slow-delayed {
    animation: none;
    transition: none;
    opacity: 1;
    transform: none;
  }
}
</style>
