<template>
  <div class="space-y-6">
    <!-- Header Section with Stats -->
    <div class="bg-brand-700 rounded-3xl p-6 lg:p-8 text-white shadow-lg">
      <div
        class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-pulse"
          >
            <AppIcon name="CreditCard" size="2xl" customClass="text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold">المدفوعات</h1>
            <p class="text-white/80 mt-1">
              إدارة سجل المدفوعات
            </p>
          </div>
        </div>
        <!-- Quick Stats -->
        <div class="flex gap-4">
          <div
            class="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]"
          >
            <p class="text-2xl font-bold">{{ payments.length }}</p>
            <p class="text-white/70 text-sm">إجمالي المدفوعات</p>
          </div>
          <div
            class="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]"
          >
            <p class="text-2xl font-bold">{{ approvedCount }}</p>
            <p class="text-white/70 text-sm">مكتملة</p>
          </div>
          <div
            class="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[120px]"
          >
            <p class="text-2xl font-bold">{{ pendingCount }}</p>
            <p class="text-white/70 text-sm">قيد المراجعة</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div
      class="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6"
    >
      <h2
        class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-3"
      >
        <AppIcon name="Sparkles" size="md" customClass="text-brand-500" />
        طرق الدفع المتاحة
      </h2>
      <div class="grid grid-cols-1 gap-4">
        <!-- Feature 1 -->
        <div
          class="flex items-start gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <div
            class="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <AppIcon
              name="DevicePhoneMobile"
              size="md"
              customClass="text-white"
            />
          </div>
          <div class="flex-1">
            <h3
              class="font-semibold text-neutral-900 dark:text-neutral-100 mb-1"
            >
              كرت الشحن
            </h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              إرسال كروت شحن المدار أو ليبيانا
              بسرعة
            </p>
          </div>
        </div>

        <!-- Feature 2 -->
        <div
          class="flex items-start gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <div
            class="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <AppIcon name="BuildingBank" size="md" customClass="text-white" />
          </div>
          <div class="flex-1">
            <h3
              class="font-semibold text-neutral-900 dark:text-neutral-100 mb-1"
            >
              التحويل البنكي
            </h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              تحويل مباشر عبر الحساب البنكي
            </p>
          </div>
        </div>

        <!-- Feature 3 -->
        <div
          class="flex items-start gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <div
            class="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <AppIcon name="ArrowPath" size="md" customClass="text-white" />
          </div>
          <div class="flex-1">
            <h3
              class="font-semibold text-neutral-900 dark:text-neutral-100 mb-1"
            >
              تطلبيقات التحويل
            </h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              سراد وتداول ومعرفة وغيرها من
              التطلبيقات
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Form Section -->
    <div
      class="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden"
    >
      <div class="p-6 lg:p-8">
        <h2
          class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-3"
        >
          <AppIcon name="Plus" size="md" customClass="text-brand-500" />
          إرسال دفعة جديدة
        </h2>

        <!-- Tab Selection -->
        <div
          class="flex flex-wrap gap-2 mb-8 p-1 bg-neutral-100 dark:bg-neutral-700 rounded-xl w-full"
        >
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="
              activeTab === tab.value
                ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-brand-700 dark:hover:text-white'
            "
            class="flex-1 min-w-[120px] px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Recharge Card -->
        <div v-if="activeTab === 'recharge'" class="space-y-6 animate-fadeIn">
          <div class="space-y-5">
            <div>
              <label
                class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >نوع الكرت</label
              >
              <select
                v-model="cardType"
                class="form-select"
              >
                <option value="madar">كرت مدار</option>
                <option value="libyana">كرت ليبيانا</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >رقم الكرت</label
              >
              <input
                v-model="cardNumber"
                type="text"
                dir="ltr"
                maxlength="16"
                class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-brand-50 dark:bg-neutral-700 text-neutral-900 dark:text-white transition-all font-mono focus:bg-white dark:focus:bg-neutral-600"
                placeholder="أدخل رقم كرت الشحن"
              />
            </div>
          </div>
          <button
            @click="submitRecharge"
            :disabled="submitting || !cardNumber.trim()"
            class="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white py-3 px-8 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <AppIcon
              v-if="submitting"
              name="ArrowPath"
              size="sm"
              customClass="animate-spin"
            />
            <AppIcon v-else name="PaperAirplane" size="sm" />
            {{ submitting ? "جاري الإرسال..." : "إرسال" }}
          </button>
        </div>

        <!-- Bank Transfer -->
        <div v-if="activeTab === 'bank'" class="space-y-6 animate-fadeIn">
          <div class="space-y-5">
            <div>
              <label
                class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >رقم الإشعار</label
              >
              <input
                v-model="transactionRef"
                type="text"
                dir="ltr"
                class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-brand-50 dark:bg-neutral-700 text-neutral-900 dark:text-white transition-all font-mono focus:bg-white dark:focus:bg-neutral-600"
                placeholder="رقم الإشعار التحويل البنكي"
              />
            </div>
            <div>
              <label
                class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >ملاحظات</label
              >
              <textarea
                v-model="notes"
                class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-brand-50 dark:bg-neutral-700 text-neutral-900 dark:text-white transition-all resize-none focus:bg-white dark:focus:bg-neutral-600"
                rows="3"
                placeholder="أضف ملاحظات اختيارية..."
              ></textarea>
            </div>
          </div>
          <button
            @click="submitPayment('bank_transfer')"
            :disabled="submitting || !transactionRef.trim()"
            class="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white py-3 px-8 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <AppIcon
              v-if="submitting"
              name="ArrowPath"
              size="sm"
              customClass="animate-spin"
            />
            <AppIcon v-else name="PaperAirplane" size="sm" />
            {{ submitting ? "جاري الإرسال..." : "إرسال" }}
          </button>
        </div>

        <!-- Money Transfer Apps -->
        <div
          v-if="activeTab === 'money_transfer'"
          class="space-y-6 animate-fadeIn"
        >
          <div class="space-y-5">
            <div>
              <label
                class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >تطلبيق التحويل</label
              >
              <select
                v-model="transferApp"
                class="form-select"
              >
                <option value="money_transfer_sarad">سراد</option>
                <option value="money_transfer_tadawul">تداول</option>
                <option value="money_transfer_egypt">معرفة</option>
                <option value="money_transfer_other">أخرى</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >رقم العملية</label
              >
              <input
                v-model="transactionRef"
                type="text"
                dir="ltr"
                class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-brand-50 dark:bg-neutral-700 text-neutral-900 dark:text-white transition-all font-mono focus:bg-white dark:focus:bg-neutral-600"
                placeholder="رقم عملية التحويل"
              />
            </div>
            <div>
              <label
                class="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2"
                >ملاحظات</label
              >
              <textarea
                v-model="notes"
                class="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-brand-50 dark:bg-neutral-700 text-neutral-900 dark:text-white transition-all resize-none focus:bg-white dark:focus:bg-neutral-600"
                rows="3"
                placeholder="أضف ملاحظات اختيارية..."
              ></textarea>
            </div>
          </div>
          <button
            @click="submitPayment(transferApp)"
            :disabled="submitting || !transactionRef.trim()"
            class="w-full inline-flex items-center justify-center gap-2 bg-brand-600 text-white py-3 px-8 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <AppIcon
              v-if="submitting"
              name="ArrowPath"
              size="sm"
              customClass="animate-spin"
            />
            <AppIcon v-else name="PaperAirplane" size="sm" />
            {{ submitting ? "جاري الإرسال..." : "إرسال" }}
          </button>
        </div>

        <!-- Message with animation -->
        <Transition name="slide-up">
          <div
            v-if="message"
            :class="
              messageType === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            "
            class="mt-6 px-5 py-4 rounded-xl border flex items-center gap-3 shadow-lg"
          >
            <AppIcon
              v-if="messageType === 'success'"
              name="CheckCircle"
              size="md"
              color="success"
            />
            <AppIcon v-else name="ExclamationCircle" size="md" color="error" />
            <p class="font-medium">{{ message }}</p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Payment History Section with Filter -->
    <div
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden"
    >
      <div
        class="px-6 py-5 border-b border-neutral-100 dark:border-neutral-700"
      >
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <h2
            class="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-3"
          >
            <AppIcon
              name="ClipboardDocumentList"
              size="md"
              customClass="text-brand-500"
            />
            سجل المدفوعات
          </h2>

          <!-- Search and Filter -->
          <div class="flex flex-col sm:flex-row gap-3">
            <!-- Search -->
            <div class="relative">
              <AppIcon
                name="MagnifyingGlass"
                size="sm"
                customClass="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="بحث..."
                class="w-full sm:w-64 pr-10 pl-4 py-2 bg-brand-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="form-select"
            >
              <option value="">كل الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div v-if="filteredPayments.length > 0" class="space-y-4">
          <div
            v-for="p in filteredPayments"
            :key="p.id"
            class="group p-5 bg-brand-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300 cursor-pointer"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4 flex-1">
                <!-- Icon with glow -->
                <div class="relative">
                  <div
                    :class="getPaymentIconBg(p.payment_method)"
                    class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                  >
                    <AppIcon
                      :name="getPaymentIcon(p.payment_method)"
                      size="md"
                      customClass="text-white"
                    />
                  </div>
                  <div
                    :class="getPaymentIconBg(p.payment_method)"
                    class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"
                  />
                </div>

                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <p
                      class="text-xl font-bold text-neutral-900 dark:text-white"
                    >
                      {{ p.amount }} د.
                    </p>
                    <span
                      :class="paymentStatusClass(p.status)"
                      class="text-xs px-3 py-1.5 rounded-full font-medium"
                      >{{ paymentStatusLabel(p.status) }}</span
                    >
                  </div>
                  <p
                    class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
                  >
                    {{ paymentMethodLabel(p.payment_method) }}
                  </p>
                  <div
                    class="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    <span class="flex items-center gap-1">
                      <AppIcon
                        name="Calendar"
                        size="xs"
                        customClass="text-neutral-400"
                      />
                      {{ formatDate(p.createdAt) }}
                    </span>
                    <span
                      v-if="p.transaction_reference"
                      class="flex items-center gap-1"
                    >
                      <AppIcon
                        name="Hashtag"
                        size="xs"
                        customClass="text-neutral-400"
                      />
                      {{ p.transaction_reference }}
                    </span>
                  </div>
                  <p
                    v-if="p.notes"
                    class="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2"
                  >
                    {{ p.notes }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-16">
          <div
            class="w-24 h-24 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"
          >
            <AppIcon
              name="CreditCard"
              size="3xl"
              customClass="text-neutral-400 dark:text-neutral-500"
            />
          </div>
          <p class="text-neutral-500 dark:text-neutral-400 font-medium text-lg">
            لا توجد مدفوعات
          </p>
          <p class="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
            ابدأ بإرسال أول دفعة
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { paymentAPI } from "@/services/api";
import { AppIcon } from "@/components/icons";
import { useAutoApplyFilters } from "@/composables/useAutoApplyFilters";

const route = useRoute();
const activeTab = ref("recharge");
const cardType = ref("madar");
const cardNumber = ref("");
const transactionRef = ref("");
const transferApp = ref("money_transfer_sarad");
const notes = ref("");
const submitting = ref(false);
const message = ref("");
const messageType = ref("success");
const payments = ref([]);

// Filter states
const searchQuery = ref("");
const statusFilter = ref("");

// Computed properties
const filteredPayments = computed(() => {
  return payments.value.filter((p) => {
    const matchesSearch =
      !searchQuery.value ||
      p.payment_method
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      p.transaction_reference
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      p.notes?.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesStatus =
      !statusFilter.value || p.status === statusFilter.value;

    return matchesSearch && matchesStatus;
  });
});

useAutoApplyFilters(
  () => [searchQuery.value, statusFilter.value],
  () => {
    // Local filtering is reactive via computed property `filteredPayments`.
    // Nothing more to do unless we want server-side filtering.
  },
  { delay: 300 }
);

const approvedCount = computed(
  () => payments.value.filter((p) => p.status === "approved").length,
);
const pendingCount = computed(
  () => payments.value.filter((p) => p.status === "pending").length,
);

const tabs = [
  { value: "recharge", label: "كرت شحن" },
  { value: "bank", label: "تحويل بنكي" },
  { value: "money_transfer", label: "طلبات تحويل" },
];

onMounted(async () => {
  try {
    const res = await paymentAPI.getMyPayments({ limit: 50 });
    payments.value = res.data?.data?.payments || [];
  } catch (error) { /* ignore */ }
});

const submitRecharge = async () => {
  if (!cardNumber.value.trim()) {
    message.value = "يرجى إدخال رقم الكرت";
    messageType.value = "error";
    return;
  }
  submitting.value = true;
  message.value = "";
  try {
    await paymentAPI.rechargeCard({
      card_number: cardNumber.value,
      card_type: cardType.value,
    });
    message.value =
      "تم إرسال كرت الشحن بنجاح، وسيتم مراجعته من الإدارة";
    messageType.value = "success";
    cardNumber.value = "";
  } catch (e) {
    message.value = e.response?.data?.message || "خطأ";
    messageType.value = "error";
  } finally {
    submitting.value = false;
  }
};

const submitPayment = async (method) => {
  submitting.value = true;
  message.value = "";
  try {
    await paymentAPI.create({
      plan_id: route.query.plan_id || null,
      payment_method: method,
      transaction_reference: transactionRef.value,
      notes: notes.value,
    });
    message.value =
      "تم إرسال طلب الدفع بنجاح، وسيتم مراجعته من الإدارة";
    messageType.value = "success";
    transactionRef.value = "";
    notes.value = "";
  } catch (e) {
    message.value = e.response?.data?.message || "خطأ";
    messageType.value = "error";
  } finally {
    submitting.value = false;
  }
};

const paymentMethodLabel = (m) =>
  ({
    recharge_madar: "كرت مدار",
    recharge_libyana: "كرت ليبيانا",
    bank_transfer: "تحويل بنكي",
    money_transfer_sarad: "سراد",
    money_transfer_tadawul: "تداول",
    money_transfer_egypt: "معرفة",
    money_transfer_other: "أخرى",
  })[m] || m;
const paymentStatusLabel = (s) =>
  ({
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
  })[s] || s;
const paymentStatusClass = (s) =>
  ({
    pending:
      "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300",
    approved:
      "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300",
    rejected: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300",
  })[s] ||
  "bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300";

const getPaymentIcon = (method) => {
  if (method.includes("recharge")) return "DevicePhoneMobile";
  if (method.includes("bank")) return "BuildingBank";
  return "ArrowPath";
};

const getPaymentIconBg = (method) => {
  if (method.includes("recharge")) return "bg-brand-500";
  if (method.includes("bank")) return "bg-brand-500";
  return "bg-brand-500";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.slide-up-enter-active {
  animation: slideUp 0.3s ease-out;
}

.slide-up-leave-active {
  animation: slideUp 0.3s ease-in reverse;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 2s ease-in-out infinite;
}
</style>
