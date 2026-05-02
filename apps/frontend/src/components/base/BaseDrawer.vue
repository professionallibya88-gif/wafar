<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[1px]"
        @click="close"
      />
    </Transition>

    <Transition name="drawer-panel">
      <aside
        v-if="show"
        :class="panelClass"
        class="fixed inset-y-0 left-0 z-[130] flex w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-neutral-900"
        dir="rtl"
      >
        <header class="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
              {{ title }}
            </h3>
            <p v-if="description" class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {{ description }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            @click="close"
          >
            <AppIcon name="XMark" size="md" />
          </button>
        </header>

        <div class="flex-1 overflow-y-auto px-5 py-5">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800"
        >
          <slot name="footer" />
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { AppIcon } from "@/components/icons";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "lg",
    validator: (value) => ["sm", "md", "lg", "xl"].includes(value),
  },
});

const emit = defineEmits(["update:show", "close"]);

const panelClass = computed(() => {
  const sizeMap = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return sizeMap[props.size];
});

const close = () => {
  emit("update:show", false);
  emit("close");
};

const handleKeydown = (event) => {
  if (event.key === "Escape" && props.show) {
    close();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active,
.drawer-panel-leave-active {
  transition:
    transform 0.28s ease,
    opacity 0.28s ease;
}

.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(-24px);
  opacity: 0;
}
</style>
