import { Cart, CartItem, Part, Supplier } from '../database/models';
import { BaseRepository } from './BaseRepository';

class CartRepository extends BaseRepository<Cart> {
  constructor() {
    super(Cart);
  }

  async findActiveCartByUserId(userId: string): Promise<Cart | null> {
    return this.model.findOne({
      where: { user_id: userId, status: 'active' },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Part,
              as: 'part',
              include: [{ model: Supplier, as: 'supplier' }],
            },
          ],
        },
      ],
      order: [[{ model: CartItem, as: 'items' }, 'created_at', 'ASC']],
    });
  }

  async getOrCreateActiveCart(userId: string): Promise<Cart> {
    let cart = await this.findActiveCartByUserId(userId);
    if (!cart) {
      cart = await this.model.create({ user_id: userId, status: 'active' });
      // Fetch again to get the full structure with empty items array
      cart = (await this.findActiveCartByUserId(userId))!;
    }
    return cart;
  }
}

export const cartRepository = new CartRepository();
