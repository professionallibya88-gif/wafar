import { orderRepository } from '../repositories/OrderRepository';
import { supplierRepository } from '../repositories/SupplierRepository';
import { NotFoundError, ForbiddenError } from '../errors';

class OrderService {
  async getSupplierOrdersByUserId(userId: string) {
    const supplier = await supplierRepository.findByUserId(userId);
    if (!supplier) {
      throw new ForbiddenError('حساب المورد غير مكتمل');
    }
    return this.getSupplierOrders(supplier.id);
  }

  async updateOrderStatusByUserId(
    userId: string,
    orderId: string,
    status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
  ) {
    const supplier = await supplierRepository.findByUserId(userId);
    if (!supplier) {
      throw new ForbiddenError('حساب المورد غير مكتمل');
    }
    return this.updateOrderStatus(orderId, supplier.id, status);
  }

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
