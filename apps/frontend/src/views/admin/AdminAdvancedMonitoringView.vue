<template>
  <div class="space-y-6">
    <BaseToast ref="toast" />
    <!-- Header -->
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          لوحة المراقبة المتقدمة
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          مراقبة الأداء والمعالجة في الوقت
          الحقيقي
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
        <select
          v-model.number="refreshInterval"
          class="form-select"
        >
          <option :value="5000">تحديث كل 5 ثوان</option>
          <option :value="10000">تحديث كل 10 ثوان</option>
          <option :value="30000">تحديث كل 30 ثانية</option>
          <option :value="60000">تحديث كل دقيقة</option>
        </select>
        <button
          @click="refreshData"
          :disabled="loading"
          class="w-full sm:w-auto px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex justify-center items-center gap-2"
        >
          <AppIcon
            name="Refresh"
            size="lg"
            :customClass="loading ? 'animate-spin' : ''"
          />
          تحديث
        </button>
      </div>
    </div>

    <!-- Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="card in statusCards"
        :key="card.title"
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border"
        :class="card.borderClass"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            {{ card.title }}
          </h3>
          <AppIcon
            :name="card.iconName"
            :size="card.iconSize || '2xl'"
            :customClass="card.iconClass"
          />
        </div>
        <p class="text-3xl font-bold" :class="card.valueClass">
          {{ card.value }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ card.subtitle }}
        </p>
        <div
          class="mt-3 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            :class="card.progressClass"
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: card.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Processing Chart -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          إحصائيات المعالجة
        </h2>
        <div class="h-64 flex items-center justify-center">
          <div class="w-full">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >مكتمل</span
              >
              <span
                class="text-sm font-bold text-green-600 dark:text-green-400"
                >{{ queueStats.completed || 0 }}</span
              >
            </div>
            <div
              class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-4"
            >
              <div
                class="bg-green-500 h-4 rounded-full"
                :style="{ width: getPercentage(queueStats.completed) + '%' }"
              ></div>
            </div>

            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >قيد المعالجة</span
              >
              <span
                class="text-sm font-bold text-blue-600 dark:text-blue-400"
                >{{ queueStats.active || 0 }}</span
              >
            </div>
            <div
              class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-4"
            >
              <div
                class="bg-blue-500 h-4 rounded-full"
                :style="{ width: getPercentage(queueStats.active) + '%' }"
              ></div>
            </div>

            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >فاشل</span
              >
              <span class="text-sm font-bold text-red-600 dark:text-red-400">{{
                queueStats.failed || 0
              }}</span>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4">
              <div
                class="bg-red-500 h-4 rounded-full"
                :style="{ width: getPercentage(queueStats.failed) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Resources -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          موارد النظام
        </h2>
        <div class="space-y-6">
          <!-- CPU -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <AppIcon name="Bolt" size="lg" customClass="text-orange-500" />
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >المعالج (CPU)</span
                >
              </div>
              <span class="text-sm font-bold text-gray-900 dark:text-white"
                >{{ cpuUsagePercent }}%</span
              >
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all"
                :class="getResourceClass(cpuUsagePercent)"
                :style="{ width: cpuUsagePercent + '%' }"
              ></div>
            </div>
          </div>

          <!-- Memory -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <AppIcon
                  name="CpuChip"
                  size="lg"
                  customClass="text-purple-500"
                />
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >الذاكرة (RAM)</span
                >
              </div>
              <span class="text-sm font-bold text-gray-900 dark:text-white"
                >{{ systemStats.memory?.usagePercent || 0 }}%</span
              >
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all"
                :class="getResourceClass(systemStats.memory?.usagePercent)"
                :style="{
                  width: (systemStats.memory?.usagePercent || 0) + '%',
                }"
              ></div>
            </div>
          </div>

          <!-- Disk -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <AppIcon
                  name="CircleStack"
                  size="lg"
                  customClass="text-blue-500"
                />
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >القرص</span
                >
              </div>
              <span class="text-sm font-bold text-gray-900 dark:text-white"
                >--</span
              >
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
              <div class="h-3 bg-blue-500 rounded-full w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tasks Table -->
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div class="p-6 border-b border-gray-100 dark:border-gray-700">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">
          المهام الحالية
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                المهمة
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                الحالة
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                التقدم
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
              >
                الوقت
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
            <tr
              v-for="task in recentTasks"
              :key="task.id"
              class="hover:bg-brand-50 dark:hover:bg-gray-700/30"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                  >
                    <AppIcon
                      name="DocumentText"
                      size="lg"
                      customClass="text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ task.name }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ task.detail }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(task.status)"
                >
                  {{ getStatusLabel(task.status) }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="w-32">
                  <div
                    class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2"
                  >
                    <div
                      class="h-2 rounded-full"
                      :class="getProgressClass(task.status)"
                      :style="{ width: task.progress + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ task.time }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        @click="clearCompleted"
        class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-right"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="Check"
              size="xl"
              customClass="text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">
              مسح المكتملة
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              حذف المهام المكتملة
            </p>
          </div>
        </div>
      </button>

      <button
        @click="retryFailed"
        class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-right"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="Refresh"
              size="xl"
              customClass="text-red-600 dark:text-red-400"
            />
          </div>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">
              إعادة الفاشلة
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              إعادة معالجة المهام الفاشلة
            </p>
          </div>
        </div>
      </button>

      <button
        @click="exportReport"
        class="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-right"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="ArrowDownTray"
              size="xl"
              customClass="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">
              تصدير التقرير
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              تحميل تقرير الأداء
            </p>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { AppIcon } from "@/components/icons";
import { BaseToast } from "@/components/base";
import { useAdminMonitoring } from "@/composables/useAdminMonitoring";
import {
  getQueuePercentage,
  getResourceClass,
  getTaskProgressClass,
  getTaskStatusClass,
  getTaskStatusLabel,
} from "@/utils/adminMonitoring";

const toast = ref(null);
const {
  avgResponse,
  cpuUsagePercent,
  errorRate,
  healthStatus,
  loading,
  queueStats,
  queueTotal,
  recentTasks,
  refreshData,
  refreshInterval,
  removeTasksByStatus,
  retryFailedTasks,
  systemStats,
} = useAdminMonitoring(toast, {
  includeTasks: true,
  defaultRefreshInterval: 10000,
});

const statusCards = computed(() => [
  {
    title: "حالة النظام",
    value: healthStatus.value === "healthy" ? "سليم" : "مشكلة",
    subtitle: "آخر فحص: " + new Date().toLocaleTimeString("ar"),
    iconName: "CheckCircle",
    iconClass:
      healthStatus.value === "healthy" ? "text-green-500" : "text-red-500",
    borderClass: "border-green-200 dark:border-green-800",
    valueClass:
      healthStatus.value === "healthy"
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400",
    progressClass:
      healthStatus.value === "healthy" ? "bg-green-500" : "bg-red-500",
    progress: healthStatus.value === "healthy" ? 100 : 0,
  },
  {
    title: "المهام النشطة",
    value: queueStats.value.active || 0,
    subtitle: "قيد المعالجة الآن",
    iconName: "Server",
    iconClass: "text-blue-500",
    borderClass: "border-blue-200 dark:border-blue-800",
    valueClass: "text-blue-600 dark:text-blue-400",
    progressClass: "bg-blue-500",
    progress: getPercentage(queueStats.value.active),
  },
  {
    title: "معدل الأخطاء",
    value: errorRate.value + "%",
    subtitle: "خلال الساعة الأخيرة",
    iconName: "ExclamationTriangle",
    iconClass: "text-red-500",
    borderClass: "border-red-200 dark:border-red-800",
    valueClass: "text-red-600 dark:text-red-400",
    progressClass: "bg-red-500",
    progress: errorRate.value,
  },
  {
    title: "زمن الاستجابة",
    value: avgResponse.value + "ms",
    subtitle: "متوسط الاستجابة",
    iconName: "Bolt",
    iconClass: "text-purple-500",
    borderClass: "border-purple-200 dark:border-purple-800",
    valueClass: "text-purple-600 dark:text-purple-400",
    progressClass: "bg-purple-500",
    progress: Math.max(100 - avgResponse.value / 10, 0),
  },
]);

const clearCompleted = () => {
  void removeTasksByStatus("completed");
};

const retryFailed = () => {
  void retryFailedTasks();
};

const exportReport = () => {
  toast.value?.addToast?.({ type: "info", message: "جاري تصدير التقرير..." });
};

const getPercentage = (value) => getQueuePercentage(value, queueTotal.value);
const getStatusClass = getTaskStatusClass;
const getStatusLabel = getTaskStatusLabel;
const getProgressClass = getTaskProgressClass;
</script>
