<template>
  <div class="dashboard-shell flex flex-col h-screen">
    <!-- الشريط العلوي -->
    <DashboardNavbar
      :is-authenticated="authStore.isAuthenticated"
      :user-name="authStore.userName"
      :user-avatar="authStore.userAvatar"
      :user-role-label="authStore.userRoleLabel"
      :sidebar-collapsed="sidebarCollapsed"
      @toggle-mobile="toggleMobileSidebar"
      @toggle-collapse="toggleSidebar"
      @logout="handleLogout"
      class="transition-all duration-300"
      :class="sidebarCollapsed ? 'lg:pr-[7rem]' : 'lg:pr-[20rem]'"
    />

    <div class="flex flex-1 relative h-full w-full">
      <!-- شاشة تظليل الخلفية -->
      <div
        v-if="showMobileSidebar"
        @click="closeMobileSidebar"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
      />

      <!-- الشريط الجانبي -->
      <DashboardSidebar
        :menu-items="menuItems"
        :is-authenticated="authStore.isAuthenticated"
        :show-mobile-sidebar="showMobileSidebar"
        :sidebar-collapsed="sidebarCollapsed"
        :is-active="isActive"
        @close-mobile="closeMobileSidebar"
      />

      <!-- المحتوى الرئيسي -->
      <main
        class="dashboard-main flex-1 transition-all duration-300"
        :class="[
          sidebarCollapsed ? 'lg:mr-[7rem]' : 'lg:mr-[20rem]',
          showMobileSidebar || (!authStore.isAuthenticated && route.path === '/') ? 'overflow-hidden' : 'overflow-auto lg:overflow-auto',
        ]"
      >
        <div class="max-w-7xl mx-auto w-full pb-32 lg:pb-8">
          <router-view />
        </div>
      </main>
    </div>

    <!-- التنقل السفلي للموبايل -->
    <DashboardBottomNav
      :items="bottomNavItems"
      :is-authenticated="authStore.isAuthenticated"
      :show-mobile-sidebar="showMobileSidebar"
      :is-active="isActive"
    />

    <!-- ويدجت الدعم الفني العائم -->
    <FloatingSupportWidget />
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useDashboardMenu } from "@/composables/useDashboardMenu";
import { useSidebarState } from "@/composables/useSidebarState";
import DashboardNavbar from "@/components/layout/DashboardNavbar.vue";
import DashboardSidebar from "@/components/layout/DashboardSidebar.vue";
import DashboardBottomNav from "@/components/layout/DashboardBottomNav.vue";
import FloatingSupportWidget from "@/components/support/FloatingSupportWidget.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const { menuItems, bottomNavItems } = useDashboardMenu();
const {
  showMobileSidebar,
  sidebarCollapsed,
  toggleMobileSidebar,
  closeMobileSidebar,
  toggleSidebar,
} = useSidebarState();

const isActive = (path) => {
  if (path === "/") return route.path === "/";
  if (path === "/admin") return route.path === "/admin";
  return route.path.startsWith(path);
};

const handleLogout = async () => {
  await authStore.logout();
  await router.push("/login");
};
</script>

<style scoped>
main {
  scroll-behavior: smooth;
}
</style>
