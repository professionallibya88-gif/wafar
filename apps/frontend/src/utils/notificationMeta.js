const ICONS = {
  info: "InformationCircle",
  success: "CheckCircle",
  warning: "ExclamationTriangle",
  error: "ExclamationCircle",
  order: "Truck",
  payment: "CreditCard",
  subscription: "Bookmark",
  system: "Cog",
  message: "ChatBubble",
};

const ICON_COLORS = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
  order: "secondary",
  payment: "success",
  subscription: "info",
  system: "gray",
  message: "info",
};

const ICON_BACKGROUNDS = {
  info: "bg-blue-100 dark:bg-blue-900/30",
  success: "bg-green-100 dark:bg-green-900/30",
  warning: "bg-yellow-100 dark:bg-yellow-900/30",
  error: "bg-red-100 dark:bg-red-900/30",
  order: "bg-purple-100 dark:bg-purple-900/30",
  payment: "bg-emerald-100 dark:bg-emerald-900/30",
  subscription: "bg-indigo-100 dark:bg-indigo-900/30",
  system: "bg-gray-100 dark:bg-gray-700/30",
  message: "bg-cyan-100 dark:bg-cyan-900/30",
};

export const getNotificationIconName = (type) => ICONS[type] || ICONS.info;

export const getNotificationIconColor = (type) => ICON_COLORS[type] || ICON_COLORS.info;

export const getNotificationIconBackgroundClass = (type) =>
  ICON_BACKGROUNDS[type] || ICON_BACKGROUNDS.info;
