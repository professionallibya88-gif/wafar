import http from "@/services/http";

export const adminAuthAPI = {
  login: (data) => http.post("/admin/auth/login", data),
  getMe: () => http.get("/admin/auth/me"),
  updateProfile: (data) => http.put("/admin/auth/profile", data),
  changePassword: (data) => http.put("/admin/auth/change-password", data),
  logout: () => http.post("/admin/auth/logout"),
};
