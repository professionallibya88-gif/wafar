import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { cartService } from '../services/CartService';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const cart = await cartService.getCart(userId);
  return ApiResponse.success(res, cart, 'تم جلب السلة بنجاح');
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { part_id, quantity } = req.body;
  const cart = await cartService.addItem(userId, part_id, quantity || 1);
  return ApiResponse.success(res, cart, 'تم إضافة القطعة للسلة بنجاح');
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { quantity } = req.body;
  const cart = await cartService.updateItemQuantity(userId, id, quantity);
  return ApiResponse.success(res, cart, 'تم تحديث الكمية بنجاح');
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const cart = await cartService.removeItem(userId, id);
  return ApiResponse.success(res, cart, 'تم حذف القطعة من السلة بنجاح');
});

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const orders = await cartService.checkout(userId);
  return ApiResponse.success(res, orders, 'تم إنشاء الطلبات بنجاح');
});
