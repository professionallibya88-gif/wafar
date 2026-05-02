import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { orderService } from '../services/OrderService';
import { ForbiddenError } from '../errors';
import { supplierRepository } from '../repositories/SupplierRepository';

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

  const supplier = await supplierRepository.findByUserId(userId);
  if (!supplier) {
    throw new ForbiddenError('حساب المورد غير مكتمل');
  }

  const orders = await orderService.getSupplierOrders(supplier.id);
  return success(res, { data: orders, message: 'تم جلب طلبات العملاء بنجاح' });
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const { id } = req.params;
  const { status } = req.body;

  if (role !== 'supplier') {
    throw new ForbiddenError('هذه العملية خاصة بالموردين فقط');
  }

  const supplier = await supplierRepository.findByUserId(userId);
  if (!supplier) {
    throw new ForbiddenError('حساب المورد غير مكتمل');
  }

  const order = await orderService.updateOrderStatus(id as string, supplier.id, status);
  return success(res, { data: order, message: 'تم تحديث حالة الطلب بنجاح' });
});
