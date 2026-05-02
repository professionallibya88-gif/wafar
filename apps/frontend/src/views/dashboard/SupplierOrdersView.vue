<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">طلبات العملاء</h1>
      <p class="text-neutral-500 dark:text-neutral-400 mt-1">إدارة الطلبات الواردة لشركتك</p>
    </div>

    <div v-if="loading" class="flex justify-center p-12">
      <AppIcon name="ArrowPath" size="xl" class="animate-spin text-brand-500" />
    </div>

    <div v-else-if="!orders.length" class="panel-card p-12 text-center">
      <AppIcon name="Inbox" size="xl" class="text-neutral-400 mx-auto mb-4" />
      <h3 class="text-lg font-bold">لا توجد طلبات</h3>
      <p class="text-neutral-500 mt-2">لم تتلقَ أي طلبات حتى الآن</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="panel-card p-6">
        <div class="flex justify-between items-start mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 class="font-bold text-lg">طلب #{{ order.order_number }}</h3>
            <p class="text-sm text-neutral-500">العميل: {{ order.retailer?.full_name }} ({{ order.retailer?.phone }})</p>
          </div>
          <div class="flex items-center gap-3">
            <select v-model="order.status" @change="updateStatus(order)" class="form-select text-sm py-1">
              <option value="pending">قيد المراجعة</option>
              <option value="processing">قيد التجهيز</option>
              <option value="ready">جاهز للاستلام</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
        
        <div class="space-y-2">
          <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm">
            <span>{{ item.quantity }}x {{ item.part?.part_name || item.part?.oem_number }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { orderAPI } from '@/services/api';
import { useNotificationStore } from '@/stores/notification';

const orders = ref([]);
const loading = ref(false);
const notify = useNotificationStore();

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await orderAPI.getSupplierOrders();
    orders.value = res.data.data;
  } catch (err) {
    notify.show('فشل جلب الطلبات', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrders);

const updateStatus = async (order) => {
  try {
    await orderAPI.updateOrderStatus(order.id, order.status);
    notify.show('تم تحديث حالة الطلب بنجاح', 'success');
  } catch (err) {
    notify.show('فشل تحديث الحالة', 'error');
    await fetchOrders(); // revert
  }
};
</script>
