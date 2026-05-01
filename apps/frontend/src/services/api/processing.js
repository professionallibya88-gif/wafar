import http from "@/services/http";

export const processingAPI = {
  health: () => http.get("/processing/health"),
  status: (jobId) => http.get(`/processing/status/${jobId}`),
  progress: () => http.get("/processing/progress"),
  tasks: (params = {}) => http.get("/processing/tasks", { params }),
  cancelTask: (jobId) => http.delete(`/processing/tasks/${jobId}`),
  retryTask: (jobId) => http.post(`/processing/retry/${jobId}`),
  metrics: () => http.get("/processing/metrics"),
  systemStats: () => http.get("/processing/system-stats"),
  alerts: (params = {}) => http.get("/processing/alerts", { params }),
  acknowledgeAlert: (alertId) =>
    http.post(`/processing/alerts/${alertId}/acknowledge`),
  getHealth() {
    return this.health();
  },
  getStatus(jobId) {
    return this.status(jobId);
  },
  getProgress() {
    return this.progress();
  },
  getTasks(params = {}) {
    return this.tasks(params);
  },
  getMetrics() {
    return this.metrics();
  },
  getSystemStats() {
    return this.systemStats();
  },
  getAlerts(params = {}) {
    return this.alerts(params);
  },

  getProfiles: () => http.get("/admin/processing-profiles"),
  getProfile: (id) => http.get(`/admin/processing-profiles/${id}`),
  createProfile: (data) => http.post("/admin/processing-profiles", data),
  updateProfile: (id, data) => http.put(`/admin/processing-profiles/${id}`, data),
  deleteProfile: (id) => http.delete(`/admin/processing-profiles/${id}`),
  toggleProfileActive: (id) => http.put(`/admin/processing-profiles/${id}/toggle-active`),
  setAsDefault: (id) => http.put(`/admin/processing-profiles/${id}/set-default`),
};


