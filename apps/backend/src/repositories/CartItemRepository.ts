import { CartItem } from '../database/models';
import { BaseRepository } from './BaseRepository';

class CartItemRepository extends BaseRepository<CartItem> {
  constructor() {
    super(CartItem);
  }

  async findByCartAndPart(cartId: string, partId: string): Promise<CartItem | null> {
    return this.model.findOne({
      where: { cart_id: cartId, part_id: partId },
    });
  }

  async clearCartItems(cartId: string): Promise<void> {
    await this.model.destroy({ where: { cart_id: cartId } });
  }
}

export const cartItemRepository = new CartItemRepository();
