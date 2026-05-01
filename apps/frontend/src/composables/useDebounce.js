import { ref, watch, onUnmounted } from "vue";

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value);

  let timeoutId = null;

  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  });

  return debouncedValue;
}
