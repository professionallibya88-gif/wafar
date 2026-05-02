import { defineStore } from 'pinia';
import { cartAPI } from '@/services/api/cart';
import { useNotificationStore } from './notification';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: null,
    loading: false,
    error: null,
  }),
  getters: {
    itemCount: (state) => state.cart?.items?.length || 0,
    totalItemsQuantity: (state) => state.cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
  },
  actions: {
    async fetchCart() {
      this.loading = true;
      try {
        const response = await cartAPI.getCart();
        this.cart = response.data.data;
        this.error = null;
      } catch (err) {
        this.error = err.response?.data?.message || 'حدث خطأ أثناء جلب السلة';
      } finally {
        this.loading = false;
      }
    },
    async addItem(partId, quantity = 1) {
      const notify = useNotificationStore();
      this.loading = true;
      try {
        const response = await cartAPI.addItem(partId, quantity);
        this.cart = response.data.data;
        notify.show('تم إضافة القطعة إلى السلة بنجاح', 'success');
      } catch (err) {
        notify.show(err.response?.data?.message || 'فشل إضافة القطعة للسلة', 'error');
      } finally {
        this.loading = false;
      }
    },
    async updateQuantity(itemId, quantity) {
      this.loading = true;
      try {
        const response = await cartAPI.updateItem(itemId, quantity);
        this.cart = response.data.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async removeItem(itemId) {
      this.loading = true;
      try {
        const response = await cartAPI.removeItem(itemId);
        this.cart = response.data.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async checkout() {
      const notify = useNotificationStore();
      this.loading = true;
      try {
        await cartAPI.checkout();
        this.cart = null; // Clear cart after successful checkout
        notify.show('تم تأكيد الطلبات بنجاح', 'success');
        return true;
      } catch (err) {
        notify.show(err.response?.data?.message || 'فشل تأكيد الطلب', 'error');
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
