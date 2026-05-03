<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">سلة المشتريات</h1>
        <p class="text-neutral-500 dark:text-neutral-400 mt-1">راجع طلباتك قبل التأكيد</p>
      </div>
    </div>

    <div v-if="cartStore.loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <BaseSkeleton v-for="i in 3" :key="i" type="card" class="h-[88px]" />
      </div>
      <div class="lg:col-span-1">
        <BaseSkeleton type="card" class="h-[180px]" />
      </div>
    </div>

    <div v-else-if="!cartStore.itemCount" class="panel-card p-12 text-center">
      <div class="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full mx-auto flex items-center justify-center mb-4">
        <AppIcon name="ShoppingCart" size="xl" class="text-neutral-400" />
      </div>
      <h3 class="text-lg font-bold text-neutral-900 dark:text-white">السلة فارغة</h3>
      <p class="text-neutral-500 mt-2">لم تقم بإضافة أي قطع إلى السلة بعد</p>
      <BaseButton @click="router.push('/search')" class="mt-6">تصفح القطع</BaseButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div v-for="item in cartStore.cart.items" :key="item.id" class="panel-card p-4 flex gap-4 items-center">
          <div class="flex-1">
            <h4 class="font-bold text-neutral-900 dark:text-white">{{ item.part?.part_name }}</h4>
            <p class="text-sm text-neutral-500">{{ item.part?.oem_number }} - {{ item.part?.supplier?.name }}</p>
          </div>
          <div class="flex items-center gap-3">
            <BaseButton @click="updateQuantity(item, -1)" variant="outline" size="sm" class="!p-1">-</BaseButton>
            <span class="font-bold w-6 text-center">{{ item.quantity }}</span>
            <BaseButton @click="updateQuantity(item, 1)" variant="outline" size="sm" class="!p-1">+</BaseButton>
          </div>
          <BaseButton @click="cartStore.removeItem(item.id)" variant="danger" size="sm" class="!p-2">
            <AppIcon name="Trash" size="sm" />
          </BaseButton>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="panel-card p-6 sticky top-24">
          <h3 class="text-lg font-bold mb-4">ملخص الطلب</h3>
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>عدد القطع</span>
              <span class="font-bold">{{ cartStore.totalItemsQuantity }}</span>
            </div>
          </div>
          <BaseButton @click="checkout" variant="primary" class="w-full" :loading="cartStore.loading">
            تأكيد الطلب
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import BaseSkeleton from '@/components/base/BaseSkeleton.vue';

const router = useRouter();
const cartStore = useCartStore();

onMounted(() => {
  cartStore.fetchCart();
});

const updateQuantity = async (item, change) => {
  const newQty = item.quantity + change;
  if (newQty > 0) {
    await cartStore.updateQuantity(item.id, newQty);
  } else {
    await cartStore.removeItem(item.id);
  }
};

const checkout = async () => {
  const success = await cartStore.checkout();
  if (success) {
    router.push('/my-orders');
  }
};
</script>
