<template>
  <div class="min-h-screen flex flex-col bg-layer-base">
    <AdminNavbar
      :user-name="authStore.userName"
      :user-role-label="authStore.userRoleLabel"
      @toggle-mobile="toggleMobileSidebar"
      @logout="handleLogout"
    />

    <div class="flex flex-1 relative">
      <div
        v-if="showMobileSidebar"
        @click="closeMobileSidebar"
        class="fixed inset-0 bg-black/50 z-[100] lg:hidden animate-fade-in"
      />

      <AdminSidebar
        :menu-sections="filteredAdminMenuSections"
        :show-mobile-sidebar="showMobileSidebar"
        :is-sidebar-collapsed="isSidebarCollapsed"
        :is-active="isActive"
        @close-mobile="closeMobileSidebar"
        @toggle-collapse="toggleSidebarCollapse"
      />

      <main
        class="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pt-4 pb-10 sm:pt-6 lg:pt-8 bg-layer-content transition-all duration-300"
        :class="showMobileSidebar ? 'overflow-hidden' : ''"
      >
        <div
          class="max-w-7xl mx-auto w-full pb-32 lg:p-6 xl:p-8 lg:min-h-[calc(100vh-6.5rem)] lg:rounded-[2rem] lg:border lg:border-neutral-200/70 dark:border-neutral-800/70 lg:bg-layer-content"
        >
          <router-view v-slot="{ Component, route }">
            <PageTransition v-bind="transitionProps">
              <component :is="Component" :key="route.fullPath" />
            </PageTransition>
          </router-view>
        </div>
      </main>
    </div>

    <AdminBottomNav
      :items="bottomNavItems"
      :show-mobile-sidebar="showMobileSidebar"
      :is-active="isActive"
    />
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAdminMenu } from "@/composables/useAdminMenu";
import { usePageTransition } from "@/composables/usePageTransition";
import AdminNavbar from "@/components/layout/AdminNavbar.vue";
import AdminSidebar from "@/components/layout/AdminSidebar.vue";
import AdminBottomNav from "@/components/layout/AdminBottomNav.vue";
import { PageTransition } from "@/components/transitions";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const { filteredAdminMenuSections, bottomNavItems } = useAdminMenu();

const { transitionProps } = usePageTransition();

const showMobileSidebar = ref(false);
const isSidebarCollapsed = ref(false);

const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value;
};

const closeMobileSidebar = () => {
  showMobileSidebar.value = false;
};

watch(showMobileSidebar, (newValue) => {
  if (window.innerWidth < 1024) {
    if (newValue) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
  }
});

const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const isActive = (path) => {
  if (path === "/admin") {
    return route.path === "/admin";
  }
  return route.path.startsWith(path);
};

const handleLogout = async () => {
  if (window.$confirm) {
    const confirmed = await window.$confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟", {
      title: "تأكيد تسجيل الخروج",
      confirmText: "تسجيل خروج",
      cancelText: "إلغاء",
      type: "danger",
      icon: "ArrowRightStartOnRectangle",
      requireTwoSteps: false
    });
    if (!confirmed) return;
  }
  await authStore.logout();
  router.push("/admin/login");
};

onUnmounted(() => {
  document.body.classList.remove("sidebar-open");
});
</script>

<style scoped>
main {
  scroll-behavior: smooth;
}

:deep(body.sidebar-open) {
  overflow: hidden;
}
</style>
