<script setup>
import { useThemeStore } from "@/stores/theme";
import { AppIcon } from "@/icons";

const themeStore = useThemeStore();

const cycleTheme = () => {
  if (themeStore.themeMode === "light") {
    themeStore.setTheme("dark");
  } else {
    themeStore.setTheme("light");
  }
};

const getThemeIcon = () => {
  return themeStore.themeMode === "light" ? "Sun" : "Moon";
};

const getThemeTitle = () => {
  return themeStore.themeMode === "light" ? "الوضع الفاتح" : "الوضع المظلم";
};
</script>

<template>
  <button
    @click="cycleTheme"
    :class="[
      'p-2 sm:p-2.5 rounded-xl transition-all duration-200',
      'bg-brand-50 dark:bg-neutral-800 hover:bg-brand-100 dark:hover:bg-neutral-700',
      'text-brand-700 dark:text-neutral-200 border border-brand-200 dark:border-neutral-700',
      'hover:shadow-sm dark:hover:shadow-none',
    ]"
    :title="getThemeTitle()"
    :aria-label="getThemeTitle()"
  >
    <AppIcon
      :name="getThemeIcon()"
      size="sm"
      customClass="w-5 h-5 sm:w-6 sm:h-6"
    />
  </button>
</template>
