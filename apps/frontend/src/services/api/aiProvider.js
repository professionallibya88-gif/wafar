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
};

export default aiProviderAPI;
