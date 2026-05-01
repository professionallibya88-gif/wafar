<template>
  <router-view v-slot="{ Component }">
    <PageTransition v-bind="transitionProps">
      <component :is="Component" />
    </PageTransition>
  </router-view>
  <BaseToast />
  <BaseConfirm />
</template>

<script setup>
import { onMounted } from "vue";
import { useSiteFont } from "./composables/useSiteFont";
import { useSiteSettings } from "./composables/useSiteSettings";
import { useThemeStore } from "./stores/theme";
import { BaseToast, BaseConfirm } from "./components/base";
import { PageTransition } from "./components/transitions";
import { usePageTransition } from "./composables/usePageTransition";

const { loadFont } = useSiteFont();
const { loadSettings } = useSiteSettings();
const themeStore = useThemeStore();
const { transitionProps } = usePageTransition();

onMounted(() => {
  themeStore.initTheme();
  loadFont();
  loadSettings();
});
</script>
