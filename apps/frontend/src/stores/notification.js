import { defineStore } from "pinia";
import { notificationAPI } from "@/services/api";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    isOpen: false,
    lastQuery: {},
  }),

  getters: {
    unreadNotifications: (state) =>
      state.notifications.filter((n) => !n.is_read),

    readNotifications: (state) => state.notifications.filter((n) => n.is_read),

    urgentNotifications: (state) =>
      state.notifications.filter((n) => n.priority === "urgent" && !n.is_read),

    highPriorityNotifications: (state) =>
      state.notifications.filter((n) => n.priority === "high" && !n.is_read),

    hasUnread: (state) => state.unreadCount > 0,

    notificationsByType: (state) => (type) =>
      state.notifications.filter((n) => n.type === type),
  },

  actions: {
    /**
     * جلب جميع الإشعارات
     */
    async fetchNotifications(params = {}, options = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await notificationAPI.getNotifications(params);
        const items = Array.isArray(response.data.data) ? response.data.data : [];
        const { append = false } = options;

        if (append) {
          const existingIds = new Set(this.notifications.map((n) => n.id));
          const newItems = items.filter((n) => !existingIds.has(n.id));
          this.notifications = [...this.notifications, ...newItems];
        } else {
          this.notifications = items;
        }

        this.lastQuery = { ...params };
        return this.notifications;
      } catch (error) {
        this.error =
          error.response?.data?.message || "فشل جلب الإشعارات";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * جلب عدد الإشعارات غير المقروءة
     */
    async fetchUnreadCount() {
      const response = await notificationAPI.getUnreadCount();
      this.unreadCount = response.data.data.count;
      return this.unreadCount;
    },

    /**
     * جلب الإشعار محدد
     */
    async fetchNotificationById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await notificationAPI.getById(id);
        const notification = response.data.data;

        // تحديث الإشعار في القائمة إذا كان موجوداً
        const index = this.notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
          this.notifications[index] = notification;
        }

        return notification;
      } catch (error) {
        this.error =
          error.response?.data?.message || "فشل جلب الإشعار";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * تعيين الإشعار مقروء
     */
    async markAsRead(id) {
      try {
        const previousNotification = this.notifications.find((n) => n.id === id);
        const response = await notificationAPI.markAsRead(id);
        const notification = response.data.data;

        // تحديث الإشعار في القائمة
        const index = this.notifications.findIndex((n) => n.id === id);
        if (index !== -1) {
          this.notifications[index] = notification;
        }

        // تحديث عدد الإشعارات غير المقروءة
        if (previousNotification && !previousNotification.is_read && this.unreadCount > 0) {
          this.unreadCount--;
        }

        return notification;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "فشل تعيين الإشعار مقروء";
        throw error;
      }
    },

    /**
     * تعيين جميع الإشعارات مقروءة
     */
    async markAllAsRead() {
      try {
        const response = await notificationAPI.markAllAsRead();
        const count = response.data.data.count;

        // تحديث جميع الإشعارات
        this.notifications = this.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date(),
        }));

        // تصفير عدد الإشعارات غير المقروءة
        this.unreadCount = 0;

        return count;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "فشل تعيين جميع الإشعارات مقروءة";
        throw error;
      }
    },

    /**
     * حذف إشعار
     */
    async deleteNotification(id) {
      try {
        const deletedNotification = this.notifications.find((n) => n.id === id);
        await notificationAPI.deleteNotification(id);

        // حذف الإشعار من القائمة
        this.notifications = this.notifications.filter((n) => n.id !== id);

        // تحديث عدد الإشعارات غير المقروءة إذا كان الإشعار غير مقروء
        if (
          deletedNotification &&
          !deletedNotification.is_read &&
          this.unreadCount > 0
        ) {
          this.unreadCount--;
        }

        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message || "فشل حذف الإشعار";
        throw error;
      }
    },

    /**
     * حذف جميع الإشعارات المقروءة
     */
    async deleteReadNotifications() {
      try {
        const response = await notificationAPI.deleteRead();
        const count = response.data.data.count;

        // حذف الإشعارات المقروءة من القائمة
        this.notifications = this.notifications.filter((n) => !n.is_read);

        return count;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "فشل حذف الإشعارات المقروءة";
        throw error;
      }
    },

    /**
     * فتح/إغلاق قائمة الإشعارات
     */
    toggleNotifications() {
      this.isOpen = !this.isOpen;
    },

    /**
     * فتح قائمة الإشعارات
     */
    openNotifications() {
      this.isOpen = true;
    },

    /**
     * إغلاق قائمة الإشعارات
     */
    closeNotifications() {
      this.isOpen = false;
    },

    /**
     * تحديث الإشعارات عند استلام الإشعار جديد
     */
    addNotification(notification) {
      const existingIndex = this.notifications.findIndex((n) => n.id === notification.id);
      const existingNotification =
        existingIndex !== -1 ? this.notifications[existingIndex] : null;

      if (existingIndex !== -1) {
        this.notifications[existingIndex] = notification;
      } else {
        this.notifications.unshift(notification);
      }

      if (
        !notification.is_read &&
        (!existingNotification || existingNotification.is_read)
      ) {
        this.unreadCount++;
      }
    },

    /**
     * إعادة تحميل الإشعارات
     */
    async refresh() {
      await Promise.all([this.fetchNotifications(), this.fetchUnreadCount()]);
    },

    /**
     * مسح الخطأ
     */
    clearError() {
      this.error = null;
    },
  },
});
