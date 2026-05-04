import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { orderService } from '../services/OrderService';
import { ForbiddenError } from '../errors';

export const getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const orders = await orderService.getRetailerOrders(userId);
  return success(res, { data: orders, message: 'تم جلب الطلبات بنجاح' });
});

export const getSupplierOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  if (role !== 'supplier') {
    throw new ForbiddenError('هذه الصفحة خاصة بالموردين فقط');
  }

  const orders = await orderService.getSupplierOrdersByUserId(userId);
  return success(res, { data: orders, message: 'تم جلب طلبات العملاء بنجاح' });
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const { id } = req.params;
  const status = req.body.status as 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';

  if (role !== 'supplier') {
    throw new ForbiddenError('هذه العملية خاصة بالموردين فقط');
  }

  const order = await orderService.updateOrderStatusByUserId(userId, id as string, status);
  return success(res, { data: order, message: 'تم تحديث حالة الطلب بنجاح' });
});
