import http from "@/services/http";

export const supplierAPI = {
  getAll: (params) => http.get("/suppliers", { params }),
  getById: (id) => http.get(`/suppliers/${id}`),
  create: (data) => http.post("/suppliers", data),
  update: (id, data) => http.put(`/suppliers/${id}`, data),
  delete: (id) => http.delete(`/suppliers/${id}`),
};


