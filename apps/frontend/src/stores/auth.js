import { defineStore } from "pinia";
import { authAPI, userAPI, adminAuthAPI } from "@/services/api";
import { authStorage } from "@/services/storage";
import { normalizePhoneNumber } from "@/utils/phone";
import { getUserRoleLabel } from "@/utils/roleLabels";

let bootstrapPromise = null;

const getProfileApi = (authStore) =>
  authStore.isAdmin ? adminAuthAPI.getMe : userAPI.getProfile;

const extractApiErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    (Array.isArray(error?.response?.data?.errors) &&       error.response.data.errors[0]?.message) ||
    fallback
  );
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: authStorage.getUser(),
    token: authStorage.getToken(),
    initialized: false,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => ["super_admin", "admin", "editor", "viewer"].includes(state.user?.role),
    userRoleLabel: (state) => getUserRoleLabel(state.user?.role),
    userName: (state) => state.user?.full_name || "",
    userAvatar: (state) => state.user?.avatar_url || "",
  },

  actions: {
    async initializeAuth() {
      if (this.initialized) return;

      if (!this.token) {
        this.initialized = true;
        return;
      }

      if (bootstrapPromise) {
        await bootstrapPromise;
        return;
      }

      bootstrapPromise = (async () => {
        try {
          await this.fetchProfile();
        } catch (error) {
          console.warn("Failed to initialize auth session", error);
          this.clearSession(true);
        } finally {
          this.initialized = true;
          bootstrapPromise = null;
        }
      })();

      await bootstrapPromise;
    },

    async login(phoneOrEmail, password, remember = false, isAdminLogin = false) {
      this.loading = true;
      this.error = null;

      try {
        let payload;
        let apiCall;
        
        if (isAdminLogin) {
          payload = { email: phoneOrEmail, password };
          apiCall = adminAuthAPI.login;
        } else {
          payload = { phone: normalizePhoneNumber(phoneOrEmail), password };
          apiCall = authAPI.login;
        }

        const res = await apiCall(payload);
        const { token, user } = res.data?.data || {};

        if (!token || !user) {
          throw new Error("استجابة الخادم غير صالحة");
        }

        this.token = token;
        this.user = user;

        authStorage.setToken(token, remember);
        authStorage.setUser(user, remember);

        return true;
      } catch (error) {
        this.error = extractApiErrorMessage(error, "رقم الهاتف/البريد أو كلمة المرور غير صحيحة");
        return false;
      } finally {
        this.loading = false;
      }
    },

    async adminLogin(email, password, remember = false) {
      return this.login(email, password, remember, true);
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const payload = {
          ...userData,
          full_name: userData.fullName || userData.full_name,
          phone: normalizePhoneNumber(userData.phone),
          password: userData.password,
          confirm_password: userData.confirmPassword || userData.confirm_password || userData.password_confirmation,
        };
        const res = await authAPI.register(payload);
        const { token, user } = res.data?.data || {};

        if (token && user) {
          this.token = token;
          this.user = user;
          authStorage.setToken(token, false);
          authStorage.setUser(user, false);
          return true;
        }
        return false;
      } catch (error) {
        this.error = extractApiErrorMessage(error, "حدث خطأ أثناء إنشاء الحساب");
        return false;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        const apiToCall = this.isAdmin ? adminAuthAPI.logout : authAPI.logout;
        await apiToCall();
      } catch (e) {
        console.warn("Logout request failed", e);
      } finally {
        this.clearSession(true);
      }
    },

    clearSession(clearTransient = false) {
      this.user = null;
      this.token = null;
      authStorage.clearSession(clearTransient);
    },

    clearError() {
      this.error = null;
    },

    async updateProfile(data) {
      this.loading = true;
      this.error = null;
      try {
        const apiToCall = this.isAdmin ? adminAuthAPI.updateProfile : userAPI.updateProfile;
        const res = await apiToCall(data);
        const updatedUser = res.data?.data;
        if (updatedUser) {
          this.user = { ...this.user, ...updatedUser };
          authStorage.setUser(this.user, authStorage.isRemembered());
          return true;
        }
        return false;
      } catch (error) {
        this.error = extractApiErrorMessage(error, "فشل تحديث الملف الشخصي");
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updatePassword(data) {
      this.loading = true;
      this.error = null;
      try {
        const apiToCall = this.isAdmin ? adminAuthAPI.changePassword : userAPI.changePassword;
        await apiToCall(data);
        return true;
      } catch (error) {
        this.error = extractApiErrorMessage(error, "فشل تغيير كلمة المرور");
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      const res = await getProfileApi(this)();
      const userData = res.data?.data;

      if (userData) {
        this.user = userData;
        authStorage.setUser(userData, authStorage.isRemembered());
      }

      return userData || null;
    },

    async uploadAvatar(formData) {
      this.loading = true;
      this.error = null;

      try {
        await userAPI.uploadAvatar(formData);
        await this.fetchProfile();
        return true;
      } catch (error) {
        this.error = extractApiErrorMessage(error, "فشل تحديث الصورة الشخصية");
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
