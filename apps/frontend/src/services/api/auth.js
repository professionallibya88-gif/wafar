import http from "@/services/http";

export const authAPI = {
  login: (data) => http.post("/auth/login", data),
  register: (data) => http.post("/auth/register", data),
  logout: () => http.post("/auth/logout"),
  requestPasswordResetOtp: (data) =>
    http.post("/auth/forgot-password/request", data),
  verifyPasswordResetOtp: (data) =>
    http.post("/auth/forgot-password/verify", data),
  completePasswordReset: (data) =>
    http.post("/auth/forgot-password/reset", data),
};


