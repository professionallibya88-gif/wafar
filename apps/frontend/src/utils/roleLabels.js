const USER_ROLE_LABELS = {
  retailer: "تاجر",
  supplier: "مورد",
};

const ADMIN_ROLE_LABELS = {
  super_admin: "المدير العام",
  admin: "مدير النظام",
  editor: "محرر الإدارة",
  viewer: "مراقب الإدارة",
};

const ADMIN_ROLES = Object.keys(ADMIN_ROLE_LABELS);

export const getUserRoleLabel = (role) => 
  ADMIN_ROLE_LABELS[role] || USER_ROLE_LABELS[role] || "مستخدم";

export const getAdminRoleLabel = (role) => ADMIN_ROLE_LABELS[role] || "حساب إداري";

export const getUserRoleBadgeVariant = (role) => {
  if (role === "supplier") {
    return "info";
  }

  if (role === "retailer") {
    return "success";
  }

  if (isAdminRole(role)) {
    return "primary";
  }

  return "default";
};

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
