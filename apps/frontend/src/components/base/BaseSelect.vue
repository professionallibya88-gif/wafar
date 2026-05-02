<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Desktop View (Native Select) -->
    <div class="hidden sm:block w-full">
      <select
        v-model="internalValue"
        :disabled="disabled"
        :class="['form-select w-full bg-white dark:bg-gray-800', selectClass]"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="(opt, index) in normalizedOptions"
          :key="index"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Mobile/Tablet View (Native-like Bottom Sheet) -->
    <div class="sm:hidden block w-full">
      <button
        type="button"
        @click="openMobileSheet"
        :disabled="disabled"
        style="background-image: none;"
        :class="[
          'form-select w-full text-right flex justify-between items-center bg-white dark:bg-gray-800',
          selectClass,
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      >
        <span class="truncate block flex-1" :class="{ 'text-gray-400': !selectedLabel && placeholder }">
          {{ selectedLabel || placeholder || 'اختر...' }}
        </span>
        <AppIcon name="ChevronDown" size="sm" class="text-gray-500 mr-2 flex-shrink-0" />
      </button>

      <BaseModal
        v-model:show="isMobileSheetOpen"
        :title="placeholder || 'اختر من القائمة'"
        size="full"
      >
        <div class="flex flex-col space-y-1">
          <button
            v-for="(opt, index) in normalizedOptions"
            :key="index"
            @click="selectOption(opt.value)"
            class="w-full text-right px-4 py-4 rounded-xl transition-colors flex items-center justify-between"
            :class="
              internalValue === opt.value
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 font-bold'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            "
          >
            <span>{{ opt.label }}</span>
            <AppIcon
              v-if="internalValue === opt.value"
              name="Check"
              size="sm"
              class="text-brand-600 dark:text-brand-400"
            />
          </button>
        </div>
      </BaseModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { BaseModal } from "@/components/base";
import { AppIcon } from "@/components/icons";

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: "",
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "",
  },
  selectClass: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
    emit("change", val);
  },
});

const normalizedOptions = computed(() => {
  return props.options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { label: String(opt), value: opt };
    }
    return opt;
  });
});

const selectedLabel = computed(() => {
  const selected = normalizedOptions.value.find(
    (opt) => opt.value === internalValue.value
  );
  return selected ? selected.label : "";
});

const isMobileSheetOpen = ref(false);

const openMobileSheet = () => {
  if (!props.disabled) {
    isMobileSheetOpen.value = true;
  }
};

const selectOption = (val) => {
  internalValue.value = val;
  isMobileSheetOpen.value = false;
};
</script>
