<template>
  <div class="min-h-screen p-4 xs:p-6 lg:p-8" dir="rtl">
    <div class="max-w-4xl mx-auto">
      <!-- رأس الصفحة -->
      <div class="mb-6">
        <h1
          class="text-2xl xs:text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          الإشعارات
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          عرض جميع إشعاراتك
        </p>
      </div>

      <!-- أزرار التحكم -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-2">
          <!-- فلتر النوع -->
          <BaseSelect
  v-model="filters.type"
  select-class="form-select"
  :options="[
    { label: 'جميع الأنواع', value: '' },
    { label: 'معلومات', value: 'info' },
    { label: 'نجاح', value: 'success' },
    { label: 'تحذير', value: 'warning' },
    { label: 'خطأ', value: 'error' },
    { label: 'طلب', value: 'order' },
    { label: 'دفع', value: 'payment' },
    { label: 'اشتراك', value: 'subscription' },
    { label: 'نظام', value: 'system' },
    { label: 'رسالة', value: 'message' },
  ]"
/>

          <!-- فلتر الحالة -->
          <BaseSelect
  v-model="filters.is_read"
  select-class="form-select"
  :options="[
    { label: 'جميع الحالات', value: '' },
    { label: 'غير مقروء', value: 'false' },
    { label: 'مقروء', value: 'true' },
  ]"
/>

          <!-- فلتر الأولوية -->
          <BaseSelect
  v-model="filters.priority"
  select-class="form-select"
  :options="[
    { label: 'جميع الأولويات', value: '' },
    { label: 'عاجل', value: 'urgent' },
    { label: 'عالي', value: 'high' },
    { label: 'متوسط', value: 'medium' },
    { label: 'منخفض', value: 'low' },
  ]"
/>
        </div>

        <div class="flex items-center gap-2">
          <!-- تعليم الكل كمقروء -->
          <button
            v-if="hasUnread"
            @click="handleMarkAllAsRead"
            class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex items-center gap-2"
            :disabled="loading"
          >
            <AppIcon name="Check" size="sm" color="white" />
            <span class="hidden sm:inline"
              >تعليم الكل كمقروء</span
            >
            <span class="sm:hidden">تعليم الكل</span>
          </button>

          <!-- حذف المقروء -->
          <button
            v-if="hasRead"
            @click="handleDeleteRead"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            :disabled="loading"
          >
            <AppIcon name="Trash" size="sm" color="white" />
            <span class="hidden sm:inline">حذف المقروء</span>
            <span class="sm:hidden">حذف</span>
          </button>

          <!-- تحديث -->
          <button
            @click="handleRefresh"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center gap-2"
            :disabled="loading"
          >
            <BaseSpinner v-if="loading" size="xs" color="gray" usage="action" />
            <AppIcon v-else name="Refresh" size="sm" />
          </button>
        </div>
      </div>

      <!-- حالة التحميل -->
      <div
        v-if="loading && notifications.length === 0"
        class="flex items-center justify-center py-12"
      >
        <BaseSpinner size="lg" usage="section" />
      </div>

      <!-- قائمة الإشعارات -->
      <div v-else-if="notifications.length > 0" class="space-y-3">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200 dark:border-gray-700"
          :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.is_read }"
        >
          <div class="flex items-start gap-4">
            <!-- أيقونة الإشعار -->
            <div
              class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              :class="getIconBackgroundClass(notification.type)"
            >
              <AppIcon
                :name="getIconName(notification.type)"
                size="lg"
                :color="getIconColor(notification.type)"
              />
            </div>

            <!-- متن الإشعار -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white"
                    :class="{ 'font-bold': !notification.is_read }"
                  >
                    {{ notification.title }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ formatTime(notification.created_at) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    v-if="notification.priority === 'urgent'"
                    class="text-xs px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  >
                    عاجل
                  </span>
                  <span
                    v-else-if="notification.priority === 'high'"
                    class="text-xs px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                  >
                    مهم
                  </span>
                  <span
                    v-if="!notification.is_read"
                    class="w-3 h-3 rounded-full bg-brand-600"
                  />
                </div>
              </div>

              <p
                class="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap"
              >
                {{ notification.message }}
              </p>

              <!-- البيانات الإضافية -->
              <div
                v-if="
                  notification.data && Object.keys(notification.data).length > 0
                "
                class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <details>
                  <summary
                    class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  >
                    عرض التفاصيل الإضافية
                  </summary>
                  <pre
                    class="text-xs text-gray-600 dark:text-gray-400 mt-2 overflow-x-auto"
                    >{{ JSON.stringify(notification.data, null, 2) }}</pre
                  >
                </details>
              </div>

              <!-- زر الإجراء -->
              <a
                v-if="notification.action_url"
                :href="notification.action_url"
                class="inline-block mt-3 text-brand-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                @click="handleActionClick(notification)"
              >
                {{ notification.action_text || "عرض التفاصيل" }}
              </a>

              <!-- أزرار التحكم -->
              <div class="flex items-center gap-2 mt-3">
                <button
                  v-if="!notification.is_read"
                  @click="handleMarkAsRead(notification.id)"
                  class="px-4 py-2 min-h-[44px] text-sm bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg transition-colors"
                  :disabled="loading"
                >
                  تعيين كمقروء
                </button>
                <button
                  @click="handleDelete(notification.id)"
                  class="px-4 py-2 min-h-[44px] text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                  :disabled="loading"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- حالة عدم وجود إشعارات -->
      <div v-else class="text-center py-12">
        <AppIcon
          name="Bell"
          size="3xl"
          color="gray"
          custom-class="mx-auto mb-4"
        />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          لا توجد إشعارات
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          ستظهر إشعاراتك هنا عندما تكون متاحة
        </p>
      </div>

      <!-- الترحيل -->
      <div
        v-if="notifications.length > 0"
        class="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          عرض {{ notifications.length }} إشعار
        </p>
        <div class="flex items-center gap-2">
          <button
            v-if="hasMore"
            @click="loadMore"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            :disabled="loading"
          >
            تحميل المزيد
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "@/stores/notification";
import { useAuthStore } from "@/stores/auth";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";
import BaseSpinner from "@/components/base/BaseSpinner.vue";
import { AppIcon } from "@/components/icons";
import {
  getNotificationIconBackgroundClass,
  getNotificationIconColor,
  getNotificationIconName,
} from "@/utils/notificationMeta";
import { formatNotificationAbsoluteTime } from "@/utils/notificationTime";

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const PAGE_SIZE = 20;

const filters = ref({
  type: "",
  is_read: "",
  priority: "",
});
const hasMore = ref(false);

const notifications = computed(() => notificationStore.notifications);
const loading = computed(() => notificationStore.loading);
const hasUnread = computed(() => notificationStore.hasUnread);
const hasRead = computed(() =>
  notificationStore.notifications.some((n) => n.is_read),
);

let pollingInterval = null;

const getIconName = getNotificationIconName;
const getIconColor = getNotificationIconColor;
const getIconBackgroundClass = getNotificationIconBackgroundClass;
const formatTime = formatNotificationAbsoluteTime;

useAutoApplyFilters(
  () => [filters.value.type, filters.value.is_read, filters.value.priority],
  () => {
    loadNotifications();
  },
  { delay: 300 }
);


const loadNotifications = async () => {
  try {
    const params = {};
    if (filters.value.type) params.type = filters.value.type;
    if (filters.value.is_read !== "")
      params.is_read = filters.value.is_read === "true";
    if (filters.value.priority) params.priority = filters.value.priority;
    params.limit = PAGE_SIZE;
    params.offset = 0;

    const items = await notificationStore.fetchNotifications(params);
    hasMore.value = items.length === PAGE_SIZE;
  } catch (error) { /* ignore */ }
};

const handleRefresh = async () => {
  await loadNotifications();
  await notificationStore.fetchUnreadCount();
};

const handleMarkAsRead = async (id) => {
  try {
    await notificationStore.markAsRead(id);
  } catch (error) { /* ignore */ }
};

const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead();
  } catch (error) { /* ignore */ }
};

const handleDelete = async (id) => {
  try {
    await notificationStore.deleteNotification(id);
  } catch (error) { /* ignore */ }
};

const handleDeleteRead = async () => {
  try {
    await notificationStore.deleteReadNotifications();
  } catch (error) { /* ignore */ }
};

const handleActionClick = (notification) => {
  if (!notification.is_read) {
    handleMarkAsRead(notification.id);
  }
};

const loadMore = async () => {
  if (loading.value || !hasMore.value) {
    return;
  }

  try {
    const params = {};
    if (filters.value.type) params.type = filters.value.type;
    if (filters.value.is_read !== "")
      params.is_read = filters.value.is_read === "true";
    if (filters.value.priority) params.priority = filters.value.priority;
    params.limit = PAGE_SIZE;
    params.offset = notifications.value.length;

    const currentCount = notifications.value.length;
    const items = await notificationStore.fetchNotifications(params, {
      append: true,
    });
    hasMore.value = items.length > currentCount && items.length - currentCount === PAGE_SIZE;
  } catch (error) { /* ignore */ }
};

const startPolling = () => {
  // تحديث كل 30 ثانية
  pollingInterval = setInterval(async () => {
    await notificationStore.fetchUnreadCount();
  }, 30000);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadNotifications();
    await notificationStore.fetchUnreadCount();
    startPolling();
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>
