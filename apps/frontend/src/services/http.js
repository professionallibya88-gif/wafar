import axios from "axios";
import { authStorage } from "./storage";
import { normalizeRedirectPath } from "@/utils/authRedirect";

const API_URL = "/api";

/**
 * عميل HTTP موحد يستخدم في جميع طلبات الواجهة الأمامية
 * يتضمن interceptors للمصادقة ومعالجة أخطاء الجلسة
 */
const http = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // عند 401: مسح الجلسة وإعادة التوجيهه
    if (error.response?.status === 401) {
      authStorage.clearSession(true);
      const isLoginPath = window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/admin/login");
      if (!isLoginPath) {
        const currentPath = normalizeRedirectPath(
          `${window.location.pathname}${window.location.search}${window.location.hash || ""}`,
        );
        const redirectQuery =
          currentPath === "/" || currentPath === "/admin"
            ? ""
            : `?redirect=${encodeURIComponent(currentPath)}`;
        
        // Redirect to admin login if they were on an admin page, otherwise standard login
        const loginUrl = window.location.pathname.startsWith("/admin") 
          ? `/admin/login${redirectQuery}` 
          : `/login${redirectQuery}`;
          
        window.location.href = loginUrl;
      }
    }
    return Promise.reject(error);
  },
);

export default http;
