import { ref, watch, onUnmounted } from "vue";

/**
 * إدارة حالة القائمة الجانبية (موبايل/ديسكتوب)
 */
export const useSidebarState = () => {
  const showMobileSidebar = ref(false);
  const sidebarCollapsed = ref(false);

  const toggleMobileSidebar = () => {
    showMobileSidebar.value = !showMobileSidebar.value;
  };

  const closeMobileSidebar = () => {
    showMobileSidebar.value = false;
  };

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  // منع التمرير في الخلفية عند فتح القائمة على الموبايل
  watch(showMobileSidebar, (newValue) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) {
      if (newValue) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    }
  });

  onUnmounted(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("sidebar-open");
    }
  });

  return {
    showMobileSidebar,
    sidebarCollapsed,
    toggleMobileSidebar,
    closeMobileSidebar,
    toggleSidebar,
  };
};
