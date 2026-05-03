import { cartService } from '../services/CartService';
import { cartRepository } from '../repositories/CartRepository';
import { cartItemRepository } from '../repositories/CartItemRepository';
import { partRepository } from '../repositories/PartRepository';
import { orderRepository } from '../repositories/OrderRepository';
import { orderItemRepository } from '../repositories/OrderItemRepository';
import { NotFoundError, ValidationError } from '../errors';

// Mock dependencies
jest.mock('../repositories/CartRepository');
jest.mock('../repositories/CartItemRepository');
jest.mock('../repositories/PartRepository');
jest.mock('../repositories/OrderRepository');
jest.mock('../repositories/OrderItemRepository');

describe('CartService', () => {
  const mockUserId = 'user-123';
  const mockPartId = 'part-123';
  const mockCartId = 'cart-123';
  const mockSupplierId = 'supp-123';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('should throw NotFoundError if part does not exist', async () => {
      (partRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(cartService.addItem(mockUserId, mockPartId, 1)).rejects.toThrow(NotFoundError);
    });

    it('should add a new item to cart if it does not exist', async () => {
      const mockPart = { id: mockPartId, supplier_id: mockSupplierId };
      const mockCart = { id: mockCartId, user_id: mockUserId };

      (partRepository.findById as jest.Mock).mockResolvedValue(mockPart);
      (cartRepository.getOrCreateActiveCart as jest.Mock).mockResolvedValue(mockCart);
      (cartItemRepository.findByCartAndPart as jest.Mock).mockResolvedValue(null);
      (cartRepository.findActiveCartByUserId as jest.Mock).mockResolvedValue({
        ...mockCart,
        items: [{ part_id: mockPartId, quantity: 1 }],
      });

      const result = await cartService.addItem(mockUserId, mockPartId, 1);

      expect(cartItemRepository.create).toHaveBeenCalledWith({
        cart_id: mockCartId,
        part_id: mockPartId,
        quantity: 1,
      });
      expect(result).toBeDefined();
    });

    it('should increment quantity if item already exists in cart', async () => {
      const mockPart = { id: mockPartId, supplier_id: mockSupplierId };
      const mockCart = { id: mockCartId, user_id: mockUserId };
      const existingItem = { id: 'item-1', quantity: 1 };

      (partRepository.findById as jest.Mock).mockResolvedValue(mockPart);
      (cartRepository.getOrCreateActiveCart as jest.Mock).mockResolvedValue(mockCart);
      (cartItemRepository.findByCartAndPart as jest.Mock).mockResolvedValue(existingItem);
      (cartRepository.findActiveCartByUserId as jest.Mock).mockResolvedValue({
        ...mockCart,
        items: [{ part_id: mockPartId, quantity: 2 }],
      });

      await cartService.addItem(mockUserId, mockPartId, 1);

      expect(cartItemRepository.updateById).toHaveBeenCalledWith(existingItem.id, {
        quantity: 2,
      });
    });
  });

  describe('checkout', () => {
    it('should throw ValidationError if cart is empty', async () => {
      (cartRepository.findActiveCartByUserId as jest.Mock).mockResolvedValue({ items: [] });

      await expect(cartService.checkout(mockUserId)).rejects.toThrow(ValidationError);
    });

    it('should process checkout, split orders by supplier, and mark cart as completed', async () => {
      const mockCart = {
        id: mockCartId,
        status: 'active',
        items: [
          { quantity: 2, part_id: 'part-1', part: { supplier_id: 'supp-1', price_cash: 10 } },
          { quantity: 1, part_id: 'part-2', part: { supplier_id: 'supp-2', price_cash: 20 } },
        ],
      };

      const mockTransaction = { id: 'tx-1' };
      (cartRepository.findActiveCartByUserId as jest.Mock).mockResolvedValue(mockCart);
      (cartRepository.transaction as jest.Mock).mockImplementation(async (callback) =>
        callback(mockTransaction)
      );
      (orderRepository.generateOrderNumber as jest.Mock).mockResolvedValue('ORD-TEST');
      (orderRepository.create as jest.Mock).mockResolvedValue({ id: 'ord-1', save: jest.fn() });

      await cartService.checkout(mockUserId);

      expect(orderRepository.create).toHaveBeenCalledTimes(2); // One for supp-1, one for supp-2
      expect(orderItemRepository.create).toHaveBeenCalledTimes(2); // Two items total
      expect(orderRepository.updateById).toHaveBeenCalledTimes(2);
      expect(cartRepository.updateById).toHaveBeenCalledWith(
        mockCartId,
        { status: 'completed' },
        { transaction: mockTransaction }
      );
    });
  });
});
