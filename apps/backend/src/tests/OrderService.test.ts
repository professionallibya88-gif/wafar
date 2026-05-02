import { orderService } from '../services/OrderService';
import { orderRepository } from '../repositories/OrderRepository';
import { NotFoundError } from '../errors';

jest.mock('../repositories/OrderRepository');

describe('OrderService', () => {
  const mockRetailerId = 'retailer-123';
  const mockSupplierId = 'supplier-123';
  const mockOrderId = 'order-123';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRetailerOrders', () => {
    it('should call orderRepository.findByRetailer', async () => {
      const mockOrders = [{ id: '1' }, { id: '2' }];
      (orderRepository.findByRetailer as jest.Mock).mockResolvedValue(mockOrders);

      const result = await orderService.getRetailerOrders(mockRetailerId);

      expect(orderRepository.findByRetailer).toHaveBeenCalledWith(mockRetailerId);
      expect(result).toEqual(mockOrders);
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw NotFoundError if order does not exist or supplier mismatch', async () => {
      (orderRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        orderService.updateOrderStatus(mockOrderId, mockSupplierId, 'ready')
      ).rejects.toThrow(NotFoundError);

      const mismatchOrder = { id: mockOrderId, supplier_id: 'wrong-supp' };
      (orderRepository.findById as jest.Mock).mockResolvedValue(mismatchOrder);

      await expect(
        orderService.updateOrderStatus(mockOrderId, mockSupplierId, 'ready')
      ).rejects.toThrow(NotFoundError);
    });

    it('should update order status successfully if supplier matches', async () => {
      const validOrder = {
        id: mockOrderId,
        supplier_id: mockSupplierId,
        status: 'pending',
        save: jest.fn(),
      };
      (orderRepository.findById as jest.Mock).mockResolvedValue(validOrder);

      const result = await orderService.updateOrderStatus(mockOrderId, mockSupplierId, 'ready');

      expect(validOrder.status).toBe('ready');
      expect(validOrder.save).toHaveBeenCalled();
      expect(result).toBe(validOrder);
    });
  });
});
