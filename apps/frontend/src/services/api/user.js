import http from "@/services/http";

export const userAPI = {
  getProfile: () => http.get("/users/profile"),
  updateProfile: (data) => http.put("/users/profile", data),
  uploadAvatar: (formData) =>
    http.post("/users/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  changePassword: (data) => http.put("/users/change-password", data),
};


