import http from "@/services/http";

const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
  timeout: 120000,
};

export const pdfAPI = {
  upload: (formData, config = {}) =>
    http.post("/pdf/upload", formData, { ...multipartConfig, ...config }),
  extractMetadata: (formData, config = {}) =>
    http.post("/pdf/extract-metadata", formData, { ...multipartConfig, ...config }),
  getFiles: (params) => http.get("/pdf/files", { params }),
  getFile: (id) => http.get(`/pdf/files/${id}`),
  deleteFile: (id) => http.delete(`/pdf/files/${id}`),
  reprocessFile: (id, data) => http.post(`/pdf/files/${id}/reprocess`, data),
  healthCheck: () => http.get("/pdf/health-check"),
  getMethodStats: () => http.get("/pdf/method-stats"),
  testMethod: (formData, config = {}) =>
    http.post("/pdf/test-method", formData, { ...multipartConfig, ...config }),
  getParts: (fileId, params) =>
    http.get(`/pdf/files/${fileId}/parts`, { params }),
  getStats: () => http.get("/pdf/stats"),
  getJobStatus: (id) => http.get(`/pdf/files/${id}/job-status`),
  getCatalogs: (params) => http.get("/pdf/catalogs", { params }),
  getVersions: (supplierId) => http.get(`/pdf/versions/${supplierId}`),
};


