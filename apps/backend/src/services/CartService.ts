import { cartRepository } from '../repositories/CartRepository';
import { cartItemRepository } from '../repositories/CartItemRepository';
import { partRepository } from '../repositories/PartRepository';
import { orderRepository } from '../repositories/OrderRepository';
import { orderItemRepository } from '../repositories/OrderItemRepository';
import { NotFoundError, ValidationError, BusinessError } from '../errors';

class CartService {
  async getCart(userId: string) {
    return await cartRepository.getOrCreateActiveCart(userId);
  }

  async addItem(userId: string, partId: string, quantity: number = 1) {
    const part = await partRepository.findById(partId);
    if (!part) throw new NotFoundError('القطعة غير موجودة');

    const cart = await cartRepository.getOrCreateActiveCart(userId);

    const existingItem = await cartItemRepository.findByCartAndPart(cart.id, partId);
    if (existingItem) {
      await cartItemRepository.updateById(existingItem.id, {
        quantity: existingItem.quantity + quantity,
      });
    } else {
      await cartItemRepository.create({
        cart_id: cart.id,
        part_id: partId,
        quantity,
      });
    }

    return await cartRepository.findActiveCartByUserId(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await cartRepository.getOrCreateActiveCart(userId);
    const item = await cartItemRepository.findById(itemId);

    if (!item || item.cart_id !== cart.id) {
      throw new NotFoundError('العنصر غير موجود في السلة');
    }

    if (quantity <= 0) {
      await cartItemRepository.deleteById(item.id);
    } else {
      await cartItemRepository.updateById(item.id, { quantity });
    }

    return await cartRepository.findActiveCartByUserId(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await cartRepository.getOrCreateActiveCart(userId);
    const item = await cartItemRepository.findById(itemId);

    if (!item || item.cart_id !== cart.id) {
      throw new NotFoundError('العنصر غير موجود في السلة');
    }

    await cartItemRepository.deleteById(item.id);
    return await cartRepository.findActiveCartByUserId(userId);
  }

  async checkout(userId: string) {
    const cart = await cartRepository.findActiveCartByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ValidationError('السلة فارغة');
    }

    // Group items by supplier
    const supplierItemsMap = new Map<string, any[]>();

    for (const item of cart.items) {
      const part = item.part;
      if (!part || !part.supplier_id) {
        throw new BusinessError('بعض القطع غير صالحة للطلب (مورد مفقود)');
      }

      const supplierId = part.supplier_id;
      if (!supplierItemsMap.has(supplierId)) {
        supplierItemsMap.set(supplierId, []);
      }
      supplierItemsMap.get(supplierId)!.push(item);
    }

    return await cartRepository.transaction(async (transaction) => {
      const createdOrders = [];

      for (const [supplierId, items] of Array.from(supplierItemsMap.entries())) {
        let totalAmount = 0;
        const orderNumber = await orderRepository.generateOrderNumber();

        const order = await orderRepository.create(
          {
            order_number: orderNumber,
            retailer_id: userId,
            supplier_id: supplierId,
            status: 'pending',
            total_amount: 0,
          },
          { transaction }
        );

        for (const item of items) {
          const unitPrice = item.part.price_cash || item.part.price || 0;
          totalAmount += unitPrice * item.quantity;

          await orderItemRepository.create(
            {
              order_id: order.id,
              part_id: item.part_id,
              quantity: item.quantity,
              unit_price: unitPrice,
            },
            { transaction }
          );
        }

        await orderRepository.updateById(order.id, { total_amount: totalAmount }, { transaction });
        order.total_amount = totalAmount; // Update local object for return
        createdOrders.push(order);
      }

      // Mark cart as completed
      await cartRepository.updateById(cart.id, { status: 'completed' }, { transaction });

      return createdOrders;
    });
  }
}

export const cartService = new CartService();
