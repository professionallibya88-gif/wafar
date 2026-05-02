import { Order, OrderItem, Part, User, Supplier } from '../database/models';
import { BaseRepository } from './BaseRepository';

class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(Order);
  }

  async findByRetailer(retailerId: string): Promise<Order[]> {
    return this.model.findAll({
      where: { retailer_id: retailerId },
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Part, as: 'part', attributes: ['id', 'part_name', 'part_code', 'oem_number'] },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async findBySupplier(supplierId: string): Promise<Order[]> {
    return this.model.findAll({
      where: { supplier_id: supplierId },
      include: [
        { model: User, as: 'retailer', attributes: ['id', 'full_name', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { model: Part, as: 'part', attributes: ['id', 'part_name', 'part_code', 'oem_number'] },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async generateOrderNumber(): Promise<string> {
    const count = await this.model.count();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `ORD-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
  }
}

export const orderRepository = new OrderRepository();
