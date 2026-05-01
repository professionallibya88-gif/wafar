import http from "@/services/http";

export const notificationAPI = {
  // مسارات المستخدمين (Auth)
  getNotifications: (params) => http.get("/notifications", { params }),
  getUnreadCount: () => http.get("/notifications/unread-count"),
  markAsRead: (id) => http.put(`/notifications/${id}/read`),
  markAllAsRead: () => http.put("/notifications/read-all"),
  deleteNotification: (id) => http.delete(`/notifications/${id}`),
  deleteRead: () => http.delete("/notifications/read"),

  // مسارات المشرف (Admin Only)
  createNotification: (data) => http.post("/notifications", data),
  broadcastNotification: (data) => http.post("/notifications/broadcast", data),
  batchCreateNotifications: (data) => http.post("/notifications/batch", data),
};


