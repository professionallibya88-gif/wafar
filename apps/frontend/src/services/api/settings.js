import http from "@/services/http";

export const settingsAPI = {
  // Public endpoint for general settings
  getPublic: () => http.get("/settings/public"),

  // Admin endpoints
  getAll: () => http.get("/settings"),
  update: (data) => http.put("/settings", data),
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


