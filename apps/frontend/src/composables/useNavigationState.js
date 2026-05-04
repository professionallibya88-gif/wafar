import { computed, ref } from "vue";

const routeNavigationDepth = ref(0);
const routeNavigationLabel = ref("");

const startRouteNavigation = (to) => {
  routeNavigationDepth.value += 1;
  routeNavigationLabel.value =
    to?.meta?.loadingLabel || to?.meta?.title || "جاري تجهيز الصفحة";
};

const finishRouteNavigation = () => {
  routeNavigationDepth.value = Math.max(0, routeNavigationDepth.value - 1);

  if (routeNavigationDepth.value === 0) {
    routeNavigationLabel.value = "";
  }
};

export function useNavigationState() {
  const isRouteNavigating = computed(() => routeNavigationDepth.value > 0);

  return {
    isRouteNavigating,
    routeNavigationLabel,
    startRouteNavigation,
    finishRouteNavigation,
  };
}
