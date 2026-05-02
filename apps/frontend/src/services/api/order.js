import http from '../http';

export const orderAPI = {
  getMyOrders: () => http.get('/orders'),
  getSupplierOrders: () => http.get('/orders/supplier'),
  updateOrderStatus: (id, status) => http.put(`/orders/${id}/status`, { status }),
};
