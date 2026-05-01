import { onUnmounted, ref, watch } from "vue";

export function useAutoApplyFilters(source, apply, options = {}) {
  const { delay = 400, deep = false, resetPage } = options;
  const isApplying = ref(false);

  let timeoutId = null;

  const clearPending = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const runApply = async () => {
    isApplying.value = true;
    try {
      await apply();
    } finally {
      isApplying.value = false;
    }
  };

  const scheduleApply = () => {
    if (typeof resetPage === "function") {
      resetPage();
    }

    clearPending();

    if (delay <= 0) {
      void runApply();
      return;
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      void runApply();
    }, delay);
  };

  const applyNow = async () => {
    clearPending();
    await runApply();
  };

  const stopWatching = watch(source, scheduleApply, { deep });

  onUnmounted(() => {
    clearPending();
    stopWatching();
  });

  return {
    isApplying,
    applyNow,
    scheduleApply,
    clearPending,
  };
}
