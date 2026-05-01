const CHECK_LABELS = {
  memory: "الذاكرة",
  cpu: "المعالج",
  errorRate: "معدل الأخطاء",
  disk: "القرص",
  database: "قاعدة البيانات",
};

const TASK_STATUS_LABELS = {
  completed: "مكتمل",
  processing: "قيد المعالجة",
  active: "قيد المعالجة",
  pending: "منتظر",
  waiting: "منتظر",
  failed: "فاشل",
};

const TASK_STATUS_CLASSES = {
  completed:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  processing:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  pending: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
  failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const TASK_PROGRESS_CLASSES = {
  completed: "bg-green-500",
  processing: "bg-blue-500",
  pending: "bg-gray-300",
  failed: "bg-red-500",
};

export const getQueueTotal = (queueStats = {}) =>
  (queueStats.waiting || 0) +
  (queueStats.active || 0) +
  (queueStats.completed || 0) +
  (queueStats.failed || 0);

export const getCpuUsagePercent = (systemStats = {}) => {
  const usage = Number(systemStats.cpu?.usage || 0);
  return usage > 0 && usage <= 1 ? Math.round(usage * 100) : Math.round(usage);
};

export const getCheckLabel = (key) => CHECK_LABELS[key] || key;

export const getAlertClass = (type) => {
  switch (type) {
    case "error":
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    case "warning":
      return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    default:
      return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
  }
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString("ar-LY");
};

export const formatTaskTime = (timestamp) => {
  if (!timestamp) return "غير معروف";
  return formatDateTime(timestamp);
};

export const formatUptime = (seconds) => {
  if (!seconds) return "0h";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const formatLoadAverage = (loadAverage) => {
  if (Array.isArray(loadAverage)) {
    return Number(loadAverage[0] || 0).toFixed(2);
  }
  if (typeof loadAverage?.one === "number") {
    return loadAverage.one.toFixed(2);
  }
  return "0.00";
};

export const getQueuePercentage = (value, queueTotal) => {
  const total = queueTotal || 1;
  return Math.round(((value || 0) / total) * 100);
};

export const getResourceClass = (value) => {
  if (value >= 80) return "bg-red-500";
  if (value >= 60) return "bg-yellow-500";
  return "bg-green-500";
};

export const normalizeTaskStatus = (status) =>
  status === "active" ? "processing" : status;

export const getTaskStatusLabel = (status) =>
  TASK_STATUS_LABELS[status] || status || "غير معروف";

export const getTaskStatusClass = (status) =>
  TASK_STATUS_CLASSES[status] || TASK_STATUS_CLASSES.pending;

export const getTaskProgressClass = (status) =>
  TASK_PROGRESS_CLASSES[status] || TASK_PROGRESS_CLASSES.pending;

export const mapMonitoringTask = (task) => {
  const normalizedStatus = normalizeTaskStatus(task.status);
  return {
    id: task.id,
    name: `المهمة #${task.id}`,
    detail: `الحالة الحالية: ${getTaskStatusLabel(task.status)}`,
    status: normalizedStatus,
    progress: Number(task.progress || 0),
    time: formatTaskTime(task.createdAt),
  };
};
