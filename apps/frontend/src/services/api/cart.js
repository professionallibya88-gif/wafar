import http from '../http';

export const cartAPI = {
  getCart: () => http.get('/cart'),
  addItem: (part_id, quantity = 1) => http.post('/cart/items', { part_id, quantity }),
  updateItem: (id, quantity) => http.put(`/cart/items/${id}`, { quantity }),
  removeItem: (id) => http.delete(`/cart/items/${id}`),
  checkout: () => http.post('/cart/checkout'),
};
