import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

export function useFloatingPosition(options) {
  const {
    triggerRef,
    isOpen,
    desktopWidth = 192,
    mobileWidth,
    viewportPadding = 16,
    offset = 8,
    mobileBreakpoint = 640,
    centerOnMobile = false,
    align = "end",
  } = options;

  const position = ref({
    top: 0,
    left: 0,
    width: typeof desktopWidth === "function" ? 0 : desktopWidth,
  });

  const resolveWidth = (viewportWidth) => {
    const isMobile = viewportWidth < mobileBreakpoint;

    if (isMobile && typeof mobileWidth === "function") {
      return mobileWidth(viewportWidth);
    }

    if (typeof desktopWidth === "function") {
      return desktopWidth(viewportWidth);
    }

    return desktopWidth;
  };

  const recalculatePosition = () => {
    if (!triggerRef.value || typeof window === "undefined") {
      return;
    }

    const rect = triggerRef.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < mobileBreakpoint;
    const width = resolveWidth(viewportWidth);

    let left;

    if (isMobile && centerOnMobile) {
      left = (viewportWidth - width) / 2;
    } else if (align === "start") {
      left = rect.left;
    } else if (align === "center") {
      left = rect.left + rect.width / 2 - width / 2;
    } else {
      left = rect.right - width;
    }

    left = Math.max(
      viewportPadding,
      Math.min(left, viewportWidth - width - viewportPadding),
    );

    position.value = {
      top: rect.bottom + offset,
      left,
      width,
    };
  };

  const handleViewportChange = () => {
    if (isOpen.value) {
      recalculatePosition();
    }
  };

  watch(isOpen, (open) => {
    if (open) {
      nextTick(() => {
        recalculatePosition();
      });
    }
  });

  onMounted(() => {
    window.addEventListener("resize", handleViewportChange, { passive: true });
    window.addEventListener("scroll", handleViewportChange, true);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", handleViewportChange);
    window.removeEventListener("scroll", handleViewportChange, true);
  });

  const floatingStyle = computed(() => ({
    top: `${position.value.top}px`,
    left: `${position.value.left}px`,
    width: `${position.value.width}px`,
  }));

  return {
    position,
    floatingStyle,
    recalculatePosition,
  };
}
