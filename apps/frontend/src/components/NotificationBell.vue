<template>
  <div class="relative">
    <!-- زر جرس الإشعارات -->
    <button
      ref="buttonRef"
      @click="toggleNotifications"
      :class="[
        'relative p-2 sm:p-2.5 rounded-xl transition-all duration-200',
        'bg-brand-50 dark:bg-neutral-800 hover:bg-brand-100 dark:hover:bg-neutral-700',
        'border border-brand-200 dark:border-neutral-700',
        'hover:shadow-sm dark:hover:shadow-none',
        hasUnread ? 'text-brand-700 dark:text-brand-400' : 'text-brand-700 dark:text-neutral-200'
      ]"
    >
      <!-- أيقونة الجرس -->
      <AppIcon 
        name="Bell" 
        size="sm" 
        customClass="w-5 h-5 sm:w-6 sm:h-6" 
      />

      <!-- شارة عدد الإشعارات غير المقروءة -->
      <BaseBadge
        v-if="unreadCount > 0"
        :value="unreadCount > 99 ? '99+' : unreadCount"
        class="absolute -top-1.5 -right-1.5 border-2 border-white dark:border-neutral-900"
      />
    </button>

    <!-- قائمة الإشعارات -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="fixed z-[130] w-[90%] sm:w-96 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          :style="dropdownStyle"
          dir="rtl"
        >
          <!-- رأس القائمة -->
          <div
            class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              الإشعارات
            </h3>
            <div class="flex items-center gap-2">
              <button
                v-if="hasUnread"
                @click="markAllAsRead"
                class="text-sm text-brand-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                :disabled="loading"
              >
                تعليم الكل كمقروء
              </button>
              <button
                @click="closeNotifications"
                class="p-1 rounded hover:bg-brand-50 dark:hover:bg-gray-700 transition-colors"
              >
                <AppIcon name="XMark" size="sm" color="gray" />
              </button>
            </div>
          </div>

          <!-- محتوى القائمة -->
          <div class="max-h-96 sm:max-h-80 overflow-y-auto">
            <!-- حالة التحميل -->
            <div v-if="loading" class="p-8 text-center">
              <BaseSpinner usage="section" />
            </div>

            <!-- قائمة الإشعارات -->
            <div v-else-if="notifications.length > 0">
              <NotificationList
                :notifications="notifications"
                @mark-read="handleMarkAsRead"
                @delete="handleDelete"
              />
            </div>

            <!-- حالة عدم وجود إشعارات -->
            <div v-else class="p-8 text-center">
              <AppIcon
                name="Bell"
                size="3xl"
                color="gray"
                customClass="mx-auto mb-4"
              />
              <p class="text-gray-500 dark:text-gray-400">
                لا توجد إشعارات
              </p>
            </div>
          </div>

          <!-- تذييل القائمة -->
          <div
            v-if="notifications.length > 0"
            class="p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              @click="handleViewAll"
              class="w-full text-center text-sm text-brand-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              عرض جميع الإشعارات
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useNotificationStore } from "@/stores/notification";
import { useAuthStore } from "@/stores/auth";
import { useFloatingPosition } from "@/composables/useFloatingPosition";
import BaseBadge from "./base/BaseBadge.vue";
import BaseSpinner from "./base/BaseSpinner.vue";
import NotificationList from "./NotificationList.vue";
import { AppIcon } from "./icons";

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const router = useRouter();

const buttonRef = ref(null);

const isOpen = computed({
  get: () => notificationStore.isOpen,
  set: (value) => {
    if (value) {
      notificationStore.openNotifications();
    } else {
      notificationStore.closeNotifications();
    }
  },
});

const { floatingStyle: dropdownStyle } = useFloatingPosition({
  triggerRef: buttonRef,
  isOpen,
  desktopWidth: 384,
  mobileWidth: (viewportWidth) => viewportWidth * 0.9,
  viewportPadding: 8,
  offset: 8,
  mobileBreakpoint: 640,
  centerOnMobile: true,
  align: "end",
});

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await notificationStore.fetchUnreadCount();
    } catch (error) { /* ignore */ }
  }
});

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const hasUnread = computed(() => notificationStore.hasUnread);
const loading = computed(() => notificationStore.loading);

const toggleNotifications = () => {
  notificationStore.toggleNotifications();
  if (isOpen.value) {
    loadNotifications();
  }
};

const closeNotifications = () => {
  notificationStore.closeNotifications();
};

const loadNotifications = async () => {
  try {
    await notificationStore.fetchNotifications({ limit: 20 });
  } catch (error) { /* ignore */ }
};

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
  } catch (error) { /* ignore */ }
};

const handleMarkAsRead = async (id) => {
  try {
    await notificationStore.markAsRead(id);
  } catch (error) { /* ignore */ }
};

const handleDelete = async (id) => {
  try {
    await notificationStore.deleteNotification(id);
  } catch (error) { /* ignore */ }
};

const handleViewAll = () => {
  closeNotifications();
  router.push({ name: "Notifications" });
};
</script>

<style scoped>
/* تخصيص شريط التمرير */
.max-h-96::-webkit-scrollbar,
.sm\:max-h-80::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track,
.sm\:max-h-80::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-96::-webkit-scrollbar-thumb,
.sm\:max-h-80::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.dark .max-h-96::-webkit-scrollbar-thumb,
.dark .sm\:max-h-80::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
