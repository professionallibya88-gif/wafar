<template>
  <div class="space-y-6">
    
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          إدارة المدفوعات
        </h1>
        <p class="mt-1 text-gray-500 dark:text-gray-400">
          مراجعة وإدارة طلبات الدفع
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <BaseSelect
  v-model="statusFilter"
  select-class="form-select"
  :options="[
    { label: 'جميع الحالات', value: '' },
    { label: 'معلق', value: 'pending' },
    { label: 'مقبول', value: 'approved' },
    { label: 'مرفوض', value: 'rejected' },
  ]"
/>
        <span
          class="text-sm text-gray-600 dark:text-gray-400 bg-brand-50 dark:bg-gray-700 px-4 py-2 rounded-full"
          >{{ pendingCount }} طلب معلق</span
        >
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div
            class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="Clock"
              size="xl"
              customClass="text-yellow-600 dark:text-yellow-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ pendingCount }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">معلق</p>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div
            class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="CheckCircle"
              size="xl"
              customClass="text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ approvedCount }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">مقبول</p>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div
            class="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="XCircle"
              size="xl"
              customClass="text-red-600 dark:text-red-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ rejectedCount }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">مرفوض</p>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div
            class="w-12 h-12 bg-brand-100 dark:bg-neutral-900/40 rounded-xl flex items-center justify-center"
          >
            <AppIcon
              name="CreditCard"
              size="xl"
              customClass="text-brand-600 dark:text-neutral-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ totalAmount }} د.
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              إجمالي المبلغ
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payments Table Card -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <!-- Pagination Top -->
      <div
        v-if="totalPages > 1 || totalPayments > 0"
        class="px-6 py-4 border-b border-gray-200 dark:border-gray-700"
      >
        <BasePagination
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :totalItems="totalPayments"
          :totalPages="totalPages"
        />
      </div>

      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full min-w-[800px]">
          <thead class="bg-brand-50 dark:bg-gray-900">
            <tr>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                المستخدم
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                المبلغ
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الطريقة
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                الحالة
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                التاريخ
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="p in payments"
              :key="p.id"
              class="hover:bg-brand-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                  <div
                    class="w-10 h-10 bg-brand-50 dark:bg-neutral-900/50 rounded-full flex items-center justify-center text-brand-600 dark:text-neutral-400 font-semibold"
                  >
                    {{ p.user?.full_name?.charAt(0) || "x" }}
                  </div>
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-white"
                    >{{ p.user?.full_name || "-" }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="text-lg font-bold text-gray-900 dark:text-white">{{
                  p.amount
                }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-300 mr-1"
                  >د.</span
                >
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-brand-700 dark:text-gray-300">{{
                  getPaymentMethodLabel(p.payment_method)
                }}</span>
              </td>
              <td class="px-4 py-4">
                <span
                  :class="'text-xs px-3 py-1.5 rounded-full font-medium ' + (getPaymentStatusVariant(p.status) === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' : getPaymentStatusVariant(p.status) === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : getPaymentStatusVariant(p.status) === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-brand-50 text-brand-700 dark:bg-gray-900/50 dark:text-gray-300')"
                  >{{ getPaymentStatusLabel(p.status) }}</span
                >
              </td>
              <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                {{ new Date(p.createdAt).toLocaleDateString("ar-LY") }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    v-if="p.status === 'pending'"
                    @click="approvePayment(p.id)"
                    class="text-green-700 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 text-sm bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800 px-4 py-2 min-h-[44px] rounded-lg transition-colors"
                  >
                    قبول
                  </button>
                  <button
                    v-if="p.status === 'pending'"
                    @click="rejectPayment(p.id)"
                    class="text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 px-4 py-2 min-h-[44px] rounded-lg transition-colors"
                  >
                    رفض
                  </button>
                  <span v-else class="text-gray-400 dark:text-gray-500 text-sm"
                    >-</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="payments.length === 0" class="text-center py-16">
          <AppIcon
            name="CreditCard"
            size="3xl"
            customClass="text-gray-300 dark:text-gray-600 mx-auto mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">
            لا توجد مدفوعات
          </p>
        </div>
      </div>

      <!-- Pagination Bottom -->
      <div
        v-if="totalPages > 1 || totalPayments > 0"
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
      >
        <BasePagination
          v-model:currentPage="currentPage"
          v-model:pageSize="pageSize"
          :totalItems="totalPayments"
          :totalPages="totalPages"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { adminAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import {  BaseSelect, BasePagination } from "@/components/base";
import { getPaymentStatusLabel, getPaymentStatusVariant, getPaymentMethodLabel } from "@/utils/statusLabels";

const payments = ref([]);
const statusFilter = ref("");

// Pagination
const currentPage = ref(1);
const pageSize = ref(20);
const totalPayments = ref(0);
const totalPages = ref(1);

onMounted(() => loadPayments());

const loadPayments = async () => {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    if (statusFilter.value) params.status = statusFilter.value;
    const res = await adminAPI.getPayments(params);
    payments.value = res.data?.data?.payments || [];
    totalPayments.value = res.data?.meta?.total || res.data?.data?.total || 0;
    totalPages.value = res.data?.meta?.totalPages || res.data?.data?.totalPages || 1;
  } catch (error) { /* ignore */ }
};

watch(pageSize, () => {
  if (currentPage.value === 1) {
    loadPayments();
  } else {
    currentPage.value = 1;
  }
});

watch(currentPage, () => {
  loadPayments();
});

watch(statusFilter, () => {
  if (currentPage.value === 1) {
    loadPayments();
  } else {
    currentPage.value = 1;
  }
});

const pendingCount = computed(
  () => payments.value.filter((p) => p.status === "pending").length,
);
const approvedCount = computed(
  () => payments.value.filter((p) => p.status === "approved").length,
);
const rejectedCount = computed(
  () => payments.value.filter((p) => p.status === "rejected").length,
);
const totalAmount = computed(() =>
  payments.value
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + (p.amount || 0), 0),
);

const approvePayment = async (id) => {
  try {
    await adminAPI.approvePayment(id, {});
    loadPayments();
  } catch (e) {
    window.$toast.error("خطأ في قبول الدفعة");
  }
};

const rejectPayment = async (id) => {
  try {
    await adminAPI.rejectPayment(id, {});
    loadPayments();
  } catch (e) {
    window.$toast.error("خطأ في رفض الدفعة");
  }
};


</script>
