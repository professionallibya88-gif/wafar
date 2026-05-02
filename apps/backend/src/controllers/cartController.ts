import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { cartService } from '../services/CartService';

export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const cart = await cartService.getCart(userId);
  return success(res, { data: cart, message: 'تم جلب السلة بنجاح' });
});

export const addItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { part_id, quantity } = req.body;
  const cart = await cartService.addItem(userId, part_id, quantity || 1);
  return success(res, { data: cart, message: 'تم إضافة القطعة للسلة بنجاح' });
});

export const updateItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { quantity } = req.body;
  const cart = await cartService.updateItemQuantity(userId, id as string, quantity);
  return success(res, { data: cart, message: 'تم تحديث الكمية بنجاح' });
});

export const removeItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const cart = await cartService.removeItem(userId, id as string);
  return success(res, { data: cart, message: 'تم حذف القطعة من السلة بنجاح' });
});

export const checkout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const orders = await cartService.checkout(userId);
  return success(res, { data: orders, message: 'تم إنشاء الطلبات بنجاح' });
});
