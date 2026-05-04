<template>
  <div class="relative inline-block" ref="dropdownRef">
    <!-- Trigger -->
    <div @click="toggle" class="cursor-pointer">
      <slot name="trigger" :open="isOpen">
        <button :class="buttonClass" class="inline-flex items-center gap-2">
          <span>{{ placeholder }}</span>
          <AppIcon
            name="ChevronDown"
            size="sm"
            :customClass="
              isOpen
                ? 'rotate-180 transition-transform'
                : 'transition-transform'
            "
          />
        </button>
      </slot>
    </div>

    <!-- Dropdown Menu -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :class="menuClass"
        class="absolute z-[80] mt-2 min-w-[200px] rounded-xl shadow-xl border overflow-hidden border-gray-200 dark:border-gray-800"
      >
        <!-- Search Input (optional) -->
        <div
          v-if="searchable"
          class="p-3 border-b border-gray-200 dark:border-gray-800"
        >
          <div class="relative">
            <AppIcon
              name="Search"
              size="sm"
              customClass="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full pr-10 pl-4 py-2 bg-brand-50 dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        <!-- Menu Items -->
        <div class="py-2 max-h-64 overflow-y-auto">
          <template v-for="(item, index) in filteredItems" :key="index">
            <!-- Divider -->
            <div
              v-if="item.divider"
              class="my-2 border-t border-gray-200 dark:border-gray-800"
            ></div>

            <!-- Item -->
            <button
              v-else
              @click="selectItem(item)"
              :class="[
                'w-full px-4 py-2.5 text-right text-sm flex items-center gap-3 transition-colors',
                item.disabled
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'hover:bg-brand-50 dark:hover:bg-neutral-700 text-gray-900 dark:text-white',
              ]"
              :disabled="item.disabled"
            >
              <!-- Icon -->
              <span v-if="item.icon" class="text-gray-400 dark:text-gray-500">
                <component :is="item.icon" class="w-5 h-5" />
              </span>

              <!-- Content -->
              <span class="flex-1">{{ item.label }}</span>

              <!-- Badge -->
              <span
                v-if="item.badge"
                :class="item.badgeClass || 'bg-brand-100 text-brand-700'"
                class="text-xs px-2 py-0.5 rounded-full"
              >
                {{ item.badge }}
              </span>

              <!-- Check for selected -->
              <AppIcon
                v-if="isSelected(item)"
                name="Check"
                size="sm"
                color="brand"
              />
            </button>
          </template>

          <!-- Empty State -->
          <div
            v-if="filteredItems.length === 0"
            class="px-4 py-8 text-center text-gray-400 dark:text-gray-500"
          >
            <AppIcon
              name="ExclamationCircle"
              size="lg"
              customClass="mx-auto mb-2 text-gray-400 dark:text-gray-500"
            />
            <p class="text-sm">{{ emptyText }}</p>
          </div>
        </div>

        <!-- Footer Slot -->
        <div
          v-if="$slots.footer"
          class="p-3 border-t border-gray-200 dark:border-gray-800 bg-brand-50 dark:bg-neutral-800"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { AppIcon } from "@/icons";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: [String, Number, Object, Array],
    default: null,
  },
  placeholder: {
    type: String,
    default: "اختر...",
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: "بحث...",
  },
  emptyText: {
    type: String,
    default: "لا توجد نتائج",
  },
  variant: {
    type: String,
    default: "default",
    validator: (v) => ["default", "dark", "primary"].includes(v),
  },
  placement: {
    type: String,
    default: "bottom-start",
    validator: (v) =>
      [
        "top",
        "bottom",
        "top-start",
        "bottom-start",
        "top-end",
        "bottom-end",
      ].includes(v),
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const searchQuery = ref("");
const dropdownRef = ref(null);

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items;
  const query = searchQuery.value.toLowerCase();
  return props.items.filter(
    (item) => !item.divider && item.label.toLowerCase().includes(query),
  );
});

const buttonClass = computed(() => {
  const base = "text-sm font-medium transition-colors";
  const variants = {
    default: "text-gray-600 hover:text-brand-700 dark:hover:text-gray-200",
    dark: "text-gray-600 dark:text-gray-300 hover:text-gray-100",
    primary:
      "text-brand-600 hover:text-brand-700 dark:text-neutral-400 dark:hover:text-brand-300",
  };
  return `${base} ${variants[props.variant]}`;
});

const menuClass = computed(() => {
  const base =
    "bg-white dark:bg-neutral-900 border-gray-200 dark:border-gray-800";
  const placements = {
    top: "bottom-full mb-2 left-0",
    bottom: "top-full mt-2 left-0",
    "top-start": "bottom-full mb-2 left-0",
    "bottom-start": "top-full mt-2 left-0",
    "top-end": "bottom-full mb-2 right-0",
    "bottom-end": "top-full mt-2 right-0",
  };
  return `${base} ${placements[props.placement]}`;
});

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = "";
  }
};

const isSelected = (item) => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(item.value);
  }
  return props.modelValue === item.value;
};

const selectItem = (item) => {
  if (item.disabled) return;

  emit("update:modelValue", item.value);
  emit("change", item);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
