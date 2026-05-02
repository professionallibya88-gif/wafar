<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">طلباتي</h1>
      <p class="text-neutral-500 dark:text-neutral-400 mt-1">متابعة حالة طلباتك من الموردين</p>
    </div>

    <div v-if="loading" class="flex justify-center p-12">
      <AppIcon name="ArrowPath" size="xl" class="animate-spin text-brand-500" />
    </div>

    <div v-else-if="!orders.length" class="panel-card p-12 text-center">
      <AppIcon name="ClipboardDocumentList" size="xl" class="text-neutral-400 mx-auto mb-4" />
      <h3 class="text-lg font-bold">لا توجد طلبات</h3>
      <p class="text-neutral-500 mt-2">لم تقم بإنشاء أي طلبات حتى الآن</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="panel-card p-6">
        <div class="flex justify-between items-start mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 class="font-bold text-lg">طلب #{{ order.order_number }}</h3>
            <p class="text-sm text-neutral-500">المورد: {{ order.supplier?.name }}</p>
          </div>
          <BaseBadge :variant="statusVariant(order.status)">{{ statusLabel(order.status) }}</BaseBadge>
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

const orders = ref([]);
const loading = ref(false);

const fetchOrders = async () => {
  loading.value = true;
  try {
    const res = await orderAPI.getMyOrders();
    orders.value = res.data.data;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrders);

const statusVariant = (s) => ({
  pending: 'warning', processing: 'primary', ready: 'success', completed: 'success', cancelled: 'danger'
}[s] || 'neutral');

const statusLabel = (s) => ({
  pending: 'قيد المراجعة', processing: 'قيد التجهيز', ready: 'جاهز للاستلام', completed: 'مكتمل', cancelled: 'ملغي'
}[s] || s);
</script>
