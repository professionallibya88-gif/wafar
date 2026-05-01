const DEFAULT_REDIRECT = "/";
const DEFAULT_ADMIN_REDIRECT = "/admin";

/**
 * تطلبيع الوجهة بعد تسجيل الدخول لمنع أي إعادة توجيه خارجية
 */
export const normalizeRedirectPath = (
  redirect,
  fallback = DEFAULT_REDIRECT,
) => {
  if (
    typeof redirect !== "string" ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//")
  ) {
    return fallback;
  }

  return redirect;
};

/**
 * تحديد الوجهة الافتراضية بعد نجاح المصادقة
 */
export const getPostAuthRedirect = (authStore, redirect) => {
  if (authStore && authStore.isAdmin) {
    return getPostAdminAuthRedirect(redirect);
  }
  return normalizeRedirectPath(redirect, DEFAULT_REDIRECT);
};

export const getPostAdminAuthRedirect = (redirect) => {
  const normalizedRedirect = normalizeRedirectPath(redirect, DEFAULT_ADMIN_REDIRECT);
  return normalizedRedirect.startsWith("/admin")
    ? normalizedRedirect
    : DEFAULT_ADMIN_REDIRECT;
};

/**
 * إنشاء رابط تسجيل الدخول مع الاحتفاظ بالوجهة المطلوبة
 */
export const buildLoginRedirect = (targetPath) => {
  const redirect = normalizeRedirectPath(targetPath);
  return {
    path: "/login",
    query: redirect === DEFAULT_REDIRECT ? {} : { redirect },
  };
};
