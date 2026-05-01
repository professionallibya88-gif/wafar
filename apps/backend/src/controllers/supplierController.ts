import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, buildPaginationMeta } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';
import { supplierService } from '../services/SupplierService';
import { AuthenticatedRequest } from '../types';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query, { defaultLimit: 50 });
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const { rows, count } = await supplierService.list({ category, limit, offset });
  return success(res, {
    data: { suppliers: rows },
    meta: buildPaginationMeta({ total: count, page, limit }),
  });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const supplier = await supplierService.getById(req.params.id as string);
  return success(res, { data: supplier });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  const supplierData = { ...req.body, user_id: userId };
  const supplier = await supplierService.create(supplierData);
  return success(res, { data: supplier, message: 'تم إضافة المورد بنجاح' });
});
