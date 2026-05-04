import http from "@/services/http";

export const aiProviderAPI = {
  // AI Providers endpoints
  getProviders: () => http.get("/admin/ai-providers"),
  getProvider: (id) => http.get(`/admin/ai-providers/${id}`),
  createProvider: (data) => http.post("/admin/ai-providers", data),
  updateProvider: (id, data) => http.put(`/admin/ai-providers/${id}`, data),
  deleteProvider: (id) => http.delete(`/admin/ai-providers/${id}`),
  toggleProviderActive: (id) => http.put(`/admin/ai-providers/${id}/toggle-active`),
  setAsDefault: (id) => http.put(`/admin/ai-providers/${id}/set-default`),
  
  // Methods expected by AdminAIProvidersView.vue
  getAll: () => http.get("/admin/ai-providers"),
  getStats: () => http.get("/admin/ai-providers/stats"),
  create: (data) => http.post("/admin/ai-providers", data),
  update: (id, data) => http.put(`/admin/ai-providers/${id}`, data),
  delete: (id) => http.delete(`/admin/ai-providers/${id}`),
  test: (id) => http.post(`/admin/ai-providers/${id}/test`),
  seedDefaults: () => http.post("/admin/ai-providers/seed-defaults"),
};

export default aiProviderAPI;
