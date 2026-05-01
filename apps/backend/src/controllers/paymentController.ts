import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created, buildPaginationMeta } from '../utils/ApiResponse';
import { parsePagination } from '../utils/pagination';
import { paymentService } from '../services/PaymentService';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError } from '../errors';

export const createPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  if (!userId) throw new ForbiddenError('لا يمكن للمدير إجراء هذه العملية');
  const payment = await paymentService.createPayment(userId, req.body);
  return created(res, {
    data: payment,
    message: 'تم إنشاء طلب الدفع بنجاح - سيتم مراجعته من قبل الإدارة',
  });
});

export const rechargeCard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user ? req.user.id : undefined;
  if (!userId) throw new ForbiddenError('لا يمكن للمدير إجراء هذه العملية');
  const payment = await paymentService.rechargeCard(userId, req.body);
  return created(res, {
    data: payment,
    message: 'تم إرسال كرت الشحن بنجاح - سيتم مراجعته من قبل الإدارة',
  });
});

export const listMyPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { limit, offset, page } = parsePagination(req.query);
  const userId = req.user ? req.user.id : undefined;
  if (!userId) {
    return success(res, {
      data: { payments: [] },
      meta: buildPaginationMeta({ total: 0, page, limit }),
    });
  }
  const { rows, count } = await paymentService.listMyPayments({
    userId,
    limit,
    offset,
  });
  return success(res, {
    data: { payments: rows },
    meta: buildPaginationMeta({ total: count, page, limit }),
  });
});
