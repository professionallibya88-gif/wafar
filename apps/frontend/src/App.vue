<template>
  <router-view v-slot="{ Component }">
    <PageTransition v-bind="transitionProps">
      <component :is="Component" />
    </PageTransition>
  </router-view>
  <BaseRouteLoader :active="isRouteNavigating" />
  <BaseToast />
  <BaseConfirm />
</template>

<script setup>
import {
  BaseToast,
  BaseConfirm,
  BaseRouteLoader,
} from "./components/base";
import { PageTransition } from "./components/transitions";
import { usePageTransition } from "./composables/usePageTransition";
import { useNavigationState } from "./composables/useNavigationState";

const { transitionProps } = usePageTransition({ metaKey: "layoutTransition" });
const { isRouteNavigating } = useNavigationState();
</script>
