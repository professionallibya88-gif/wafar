<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-700">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="p-4 hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors"
      :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.is_read }"
    >
      <div class="flex items-start gap-3">
        <!-- أيقونة الإشعار -->
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          :class="getIconBackgroundClass(notification.type)"
        >
          <AppIcon
            :name="getIconName(notification.type)"
            size="sm"
            :color="getIconColor(notification.type)"
          />
        </div>

        <!-- محتوى الإشعار -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h4
              class="text-sm font-medium text-gray-900 dark:text-white truncate"
              :class="{ 'font-semibold': !notification.is_read }"
            >
              {{ notification.title }}
            </h4>
            <span
              v-if="!notification.is_read"
              class="flex-shrink-0 w-2 h-2 rounded-full bg-brand-600"
            />
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {{ notification.message }}
          </p>
          <div class="flex items-center gap-3 mt-2">
            <span class="text-xs text-gray-500 dark:text-gray-500">
              {{ formatTime(notification.created_at) }}
            </span>
            <span
              v-if="notification.priority === 'urgent'"
              class="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            >
              عاجل
            </span>
            <span
              v-else-if="notification.priority === 'high'"
              class="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
            >
              مهم
            </span>
          </div>

          <!-- زر الإجراء -->
          <a
            v-if="notification.action_url"
            :href="notification.action_url"
            class="inline-block mt-2 text-sm text-brand-600 dark:text-neutral-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            @click="handleActionClick(notification)"
          >
            {{ notification.action_text || "عرض التفاصيل" }}
          </a>
        </div>

        <!-- أزرار الإجراءات -->
        <div class="flex flex-col items-center gap-1">
          <button
            v-if="!notification.is_read"
            @click="$emit('mark-read', notification.id)"
            class="p-1 rounded hover:bg-brand-100 dark:hover:bg-gray-600 transition-colors"
            title="تعيين كمقروء"
          >
            <AppIcon name="Check" size="xs" color="gray" />
          </button>
          <button
            @click="$emit('delete', notification.id)"
            class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            title="حذف"
          >
            <AppIcon name="Trash" size="xs" color="gray" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AppIcon } from "./icons";
import {
  getNotificationIconBackgroundClass,
  getNotificationIconColor,
  getNotificationIconName,
} from "@/utils/notificationMeta";
import { formatNotificationRelativeTime } from "@/utils/notificationTime";

defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['mark-read', 'delete']);

const getIconName = getNotificationIconName;
const getIconColor = getNotificationIconColor;
const getIconBackgroundClass = getNotificationIconBackgroundClass;
const formatTime = formatNotificationRelativeTime;

const handleActionClick = (notification) => {
  if (!notification.is_read) {
    emit("mark-read", notification.id);
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
