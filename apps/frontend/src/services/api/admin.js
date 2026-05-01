import http from "@/services/http";

export const adminAPI = {
  // الإحصائيات
  getStats: () => http.get("/admin/stats"),
  getSystemStats: () => http.get("/admin/system-stats"),

  // إدارة المستخدمين
  getUsers: (params) => http.get("/admin/users", { params }),
  toggleUserActive: (id) => http.put(`/admin/users/${id}/toggle-active`),
  updateUser: (id, data) => http.put(`/admin/users/${id}`, data),
  deleteUser: (id) => http.delete(`/admin/users/${id}`),

  // إدارة الموردين
  createSupplier: (data) => http.post("/admin/suppliers", data),
  updateSupplier: (id, data) => http.put(`/admin/suppliers/${id}`, data),
  deleteSupplier: (id) => http.delete(`/admin/suppliers/${id}`),

  // إدارة المديرين
  getAdmins: (params) => http.get("/admin/admins", { params }),
  createAdmin: (data) => http.post("/admin/admins", data),
  updateAdmin: (id, data) => http.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => http.delete(`/admin/admins/${id}`),
  toggleAdminActive: (id) => http.put(`/admin/admins/${id}/toggle-active`),

  // إدارة المدفوعات
  getPayments: (params) => http.get("/admin/payments", { params }),
  approvePayment: (id, data) => http.put(`/admin/payments/${id}/approve`, data),
  rejectPayment: (id, data) => http.put(`/admin/payments/${id}/reject`, data),

  // إدارة قطع الغيار
  getParts: (params) => http.get("/admin/parts", { params }),
  getPartFilterOptions: () => http.get("/admin/parts/filter-options"),
  createPart: (data) => http.post("/admin/parts", data),
  updatePart: (id, data) => http.put(`/admin/parts/${id}`, data),
  deletePart: (id) => http.delete(`/admin/parts/${id}`),

  // إدارة باقات الاشتراك
  getPlans: () => http.get("/admin/plans"),
  createPlan: (data) => http.post("/admin/plans", data),
  updatePlan: (id, data) => http.put(`/admin/plans/${id}`, data),
  deletePlan: (id) => http.delete(`/admin/plans/${id}`),

  // جميع ملفات PDF
  getAllFiles: (params) => http.get("/admin/pdf-files", { params }),
  reprocessFile: (id, data = {}) =>
    http.post(`/admin/pdf-files/${id}/reprocess`, data),
  deleteFile: (id) => http.delete(`/admin/pdf-files/${id}`),

  // المراقبة والإحصائيات
  getMonitoringMetrics: () => http.get("/admin/monitoring/metrics"),
  getMonitoringHealth: () => http.get("/admin/monitoring/health"),
  getMonitoringPerformance: (params) => http.get("/admin/monitoring/performance", { params }),

  // إدارة الكاش
  getCacheStats: () => http.get("/admin/cache/stats"),
  clearCache: (pattern) => http.post("/admin/cache/clear", { pattern }),

  // إدارة طوابير المعالجة
  getQueuesStatus: () => http.get("/admin/queues/status"),
  pauseQueue: (queueName) => http.post(`/admin/queues/${queueName}/pause`),
  resumeQueue: (queueName) => http.post(`/admin/queues/${queueName}/resume`),
  cleanQueue: (queueName, status) => http.post(`/admin/queues/${queueName}/clean`, { status }),
  
  // سجلات النشاط
  getActivityLogs: (params) => http.get("/admin/activity-logs", { params }),
};


