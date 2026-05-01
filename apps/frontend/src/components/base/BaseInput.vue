<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-error-500">*</span>
    </label>

    <!-- Input Wrapper -->
    <div class="relative">
      <!-- Icon Left -->
      <div
        v-if="$slots.prefix"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400 dark:text-neutral-500"
      >
        <slot name="prefix" />
      </div>

      <!-- Input -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :class="[
          'input',
          'rounded-xl',
          'text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500',
          'transition-all duration-200',
          $slots.prefix ? 'pr-10' : '',
          $slots.suffix ? 'pl-10' : '',
          sizeClasses,
          error
            ? 'border-error-500 focus:border-error-500 focus:ring-error-200 dark:focus:ring-error-900'
            : success
              ? 'border-success-500 focus:border-success-500 focus:ring-success-200 dark:focus:ring-success-900'
              : 'focus:ring-brand-100 dark:focus:ring-brand-900/30',
          disabled
            ? 'bg-brand-50 dark:bg-neutral-800 cursor-not-allowed opacity-70'
            : '',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />

      <!-- Icon Right -->
      <div
        v-if="$slots.suffix"
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-400 dark:text-neutral-500"
      >
        <slot name="suffix" />
      </div>

      <!-- Clear Button -->
      <button
        v-if="clearable && modelValue"
        type="button"
        class="absolute inset-y-0 left-0 flex items-center px-3 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
        @click="$emit('update:modelValue', '')"
      >
        <AppIcon name="X" size="sm" />
      </button>
    </div>

    <!-- Helper Text -->
    <p
      v-if="hint && !error"
      class="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400"
    >
      {{ hint }}
    </p>

    <!-- Error Message -->
    <p
      v-if="error"
      class="mt-1.5 text-xs text-error-600 dark:text-error-400 flex items-center gap-1"
    >
      <AppIcon name="ExclamationCircle" size="xs" />
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { AppIcon } from "@/icons";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  hint: {
    type: String,
    default: "",
  },
  error: {
    type: String,
    default: "",
  },
  success: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: "off",
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  inputId: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  },
});

defineEmits(["update:modelValue", "focus", "blur"]);

const sizeClasses = computed(() => {
  const sizes = {
    sm: "text-base sm:text-sm py-2.5 px-3.5 min-h-[44px] sm:min-h-[40px]",
    md: "text-base py-3 px-4 min-h-[48px] sm:min-h-[44px]",
    lg: "text-lg py-3.5 px-4.5 min-h-[56px] sm:min-h-[52px]",
  };
  return sizes[props.size];
});
</script>
