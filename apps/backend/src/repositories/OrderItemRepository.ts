import { OrderItem } from '../database/models';
import { BaseRepository } from './BaseRepository';

class OrderItemRepository extends BaseRepository<OrderItem> {
  constructor() {
    super(OrderItem);
  }
}

export const orderItemRepository = new OrderItemRepository();
