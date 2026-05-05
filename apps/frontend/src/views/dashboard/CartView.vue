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
      <div class="lg:col-span-2 space-y-6">
        <div v-for="group in cartStore.groupedItemsBySupplier" :key="group.supplier.id" class="panel-card overflow-hidden">
          <!-- Supplier Header -->
          <div class="bg-neutral-50 dark:bg-neutral-800/50 p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white dark:bg-neutral-700 rounded-full flex items-center justify-center shadow-sm">
                <AppIcon name="BuildingOffice" size="md" class="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 class="font-bold text-neutral-900 dark:text-white">{{ group.supplier.name }}</h3>
                <p v-if="group.supplier.phone" class="text-xs text-neutral-500 mt-0.5" dir="ltr">{{ group.supplier.phone }}</p>
              </div>
            </div>
            <div class="text-left">
              <p class="text-sm font-bold text-brand-600 dark:text-brand-400">{{ formatCurrency(group.subtotal, 'د.ل') }}</p>
              <p class="text-xs text-neutral-500">{{ group.totalQuantity }} قطعة</p>
            </div>
          </div>
          
          <!-- Supplier Items -->
          <div class="divide-y divide-neutral-100 dark:divide-neutral-800">
            <div v-for="item in group.items" :key="item.id" class="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div class="flex-1">
                <h4 class="font-bold text-neutral-900 dark:text-white text-sm sm:text-base">{{ item.part?.part_name }}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-400">{{ item.part?.oem_number || item.part?.part_code }}</span>
                  <span v-if="item.part?.brand && item.part?.brand !== '-'" class="text-xs text-neutral-500">{{ item.part.brand }}</span>
                </div>
              </div>
              <div class="text-left w-full sm:w-auto flex justify-between sm:block items-center">
                <div class="font-bold text-neutral-900 dark:text-white sm:mb-2">
                  {{ formatCurrency((item.part?.price_cash || item.part?.price || 0) * item.quantity, 'د.ل') }}
                  <span class="text-xs text-neutral-400 font-normal block sm:inline">({{ formatCurrency(item.part?.price_cash || item.part?.price || 0, '') }} للقطعة)</span>
                </div>
                <div class="flex items-center gap-3">
                  <BaseButton @click="updateQuantity(item, -1)" variant="outline" size="sm" class="!p-1 w-8 h-8 flex items-center justify-center">-</BaseButton>
                  <span class="font-bold w-6 text-center">{{ item.quantity }}</span>
                  <BaseButton @click="updateQuantity(item, 1)" variant="outline" size="sm" class="!p-1 w-8 h-8 flex items-center justify-center">+</BaseButton>
                  <BaseButton @click="cartStore.removeItem(item.id)" variant="danger" size="sm" class="!p-1.5 w-8 h-8 flex items-center justify-center ml-2">
                    <AppIcon name="Trash" size="sm" />
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="panel-card p-6 sticky top-24">
          <h3 class="text-lg font-bold mb-4">ملخص الطلب</h3>
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>الموردين / الشركات</span>
              <span class="font-bold">{{ cartStore.groupedItemsBySupplier.length }}</span>
            </div>
            <div class="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>إجمالي القطع</span>
              <span class="font-bold">{{ cartStore.totalItemsQuantity }}</span>
            </div>
            <div class="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between text-neutral-900 dark:text-white font-bold text-lg">
              <span>الإجمالي العام</span>
              <span>{{ formatCurrency(cartStore.groupedItemsBySupplier.reduce((acc, g) => acc + g.subtotal, 0), 'د.ل') }}</span>
            </div>
          </div>
          <BaseButton @click="checkout" variant="primary" class="w-full" :loading="cartStore.loading">
            تأكيد الطلب
          </BaseButton>
          <p class="text-xs text-neutral-500 mt-3 text-center">
            سيتم تقسيم الطلب تلقائياً لكل مورد على حدة
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { formatCurrency } from '@/utils/currency';
import BaseSkeleton from '@/components/base/BaseSkeleton.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import { AppIcon } from '@/components/icons';

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
