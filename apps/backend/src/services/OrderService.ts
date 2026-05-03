import { orderRepository } from '../repositories/OrderRepository';
import { NotFoundError } from '../errors';

class OrderService {
  async getRetailerOrders(retailerId: string) {
    return await orderRepository.findByRetailer(retailerId);
  }

  async getSupplierOrders(supplierId: string) {
    return await orderRepository.findBySupplier(supplierId);
  }

  async updateOrderStatus(
    orderId: string,
    supplierId: string,
    status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
  ) {
    const order = await orderRepository.findById(orderId);
    if (!order || order.supplier_id !== supplierId) {
      throw new NotFoundError('الطلب غير موجود أو لا تملك صلاحية تعديله');
    }

    await orderRepository.updateById(orderId, { status });
    order.status = status; // update local object before return
    return order;
  }
}

export const orderService = new OrderService();
