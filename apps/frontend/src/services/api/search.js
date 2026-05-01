import http from "@/services/http";

export const searchAPI = {
  search: (params) => http.get("/search", { params }),
  compare: (partIds) =>
    http.get("/search/compare", { params: { ids: partIds } }),
  getHistory: (params) => http.get("/search/history", { params }),
  getCategories: () => http.get("/search/categories"),
  getBrands: () => http.get("/search/brands"),
  exportResults: (params) =>
    http.get("/search/export", { params, responseType: "blob" }),
  smart: (params) => http.get("/search/smart", { params }),
  derived: (params) => http.get("/search/derived", { params }),
};


