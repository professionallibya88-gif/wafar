import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const DEFAULT_TRANSITION_CONFIG = {
  preset: "fade",
  reducedMotionPreset: "reduced",
  mode: "out-in",
};

const getHistoryPosition = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return Number.isFinite(window.history.state?.position)
    ? window.history.state.position
    : null;
};

export function usePageTransition(options = {}) {
  const route = useRoute();
  const metaKey = options.metaKey || "pageTransition";
  const prefersReducedMotion = ref(false);
  const transitionDirection = ref("forward");
  const lastHistoryPosition = ref(getHistoryPosition());

  let motionMediaQuery;
  let motionMediaQueryListener;

  const getTransitionConfig = (routeLocation) => {
    return {
      ...DEFAULT_TRANSITION_CONFIG,
      ...(routeLocation?.meta?.[metaKey] || {}),
    };
  };

  const createRouteSnapshot = (routeLocation) => {
    const config = getTransitionConfig(routeLocation);

    return {
      fullPath: routeLocation.fullPath,
      level:
        config.level ?? routeLocation.path.split("/").filter(Boolean).length,
      preset: config.preset,
    };
  };

  const previousSnapshot = ref(createRouteSnapshot(route));

  const inferDirection = (currentSnapshot, previousRouteSnapshot) => {
    const currentHistoryPosition = getHistoryPosition();

    if (currentHistoryPosition !== null && lastHistoryPosition.value !== null) {
      if (currentHistoryPosition < lastHistoryPosition.value) {
        lastHistoryPosition.value = currentHistoryPosition;
        return "back";
      }

      if (currentHistoryPosition > lastHistoryPosition.value) {
        lastHistoryPosition.value = currentHistoryPosition;
        return "forward";
      }
    }

    lastHistoryPosition.value = currentHistoryPosition;

    if (currentSnapshot.level < previousRouteSnapshot.level) {
      return "back";
    }

    if (currentSnapshot.level > previousRouteSnapshot.level) {
      return "forward";
    }

    if (currentSnapshot.preset !== previousRouteSnapshot.preset) {
      return "forward";
    }

    return "forward";
  };

  const updateReducedMotionPreference = () => {
    prefersReducedMotion.value = Boolean(motionMediaQuery?.matches);
  };

  onMounted(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    updateReducedMotionPreference();
    motionMediaQueryListener = updateReducedMotionPreference;

    if (typeof motionMediaQuery.addEventListener === "function") {
      motionMediaQuery.addEventListener("change", motionMediaQueryListener);
      return;
    }

    motionMediaQuery.addListener(motionMediaQueryListener);
  });

  onUnmounted(() => {
    if (!motionMediaQuery || !motionMediaQueryListener) {
      return;
    }

    if (typeof motionMediaQuery.removeEventListener === "function") {
      motionMediaQuery.removeEventListener("change", motionMediaQueryListener);
      return;
    }

    motionMediaQuery.removeListener(motionMediaQueryListener);
  });

  watch(
    () => route.fullPath,
    () => {
      const currentSnapshot = createRouteSnapshot(route);
      transitionDirection.value = inferDirection(
        currentSnapshot,
        previousSnapshot.value,
      );
      previousSnapshot.value = currentSnapshot;
    },
  );

  const transitionProps = computed(() => {
    const transitionConfig = getTransitionConfig(route);

    return {
      type: prefersReducedMotion.value
        ? transitionConfig.reducedMotionPreset
        : transitionConfig.preset,
      direction: transitionDirection.value,
      mode: transitionConfig.mode,
    };
  });

  return {
    transitionProps,
    transitionDirection,
    prefersReducedMotion,
    getTransitionConfig,
  };
}
