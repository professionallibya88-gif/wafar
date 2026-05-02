import http from "@/services/http";

export const settingsAPI = {
  // Public endpoint for general settings
  getPublic: () => http.get("/settings/public"),

  // Admin endpoints
  getAll: () => http.get("/settings"),
  update: (keyOrData, value) => {
    if (typeof keyOrData === "string") {
      return http.put(`/settings/${keyOrData}`, { value });
    }
    return http.put("/settings", keyOrData);
  },
  updateAll: (data) => http.put("/settings", data),
  resetDefaults: () => http.post("/settings/reset-defaults"),
  testEmail: () => http.post("/settings/test-email"),
  uploadImage: (file, type) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);
    return http.post("/settings/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};


