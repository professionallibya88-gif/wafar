import { Response } from 'express';
import { supportTicketService } from '../services/SupportTicketService';
import { success, created } from '../utils/ApiResponse';
import { buildPaginationMeta } from '../utils/pagination';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';

export const getUserTickets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await supportTicketService.getUserTickets(req.user!.id, req.query);
  const meta = buildPaginationMeta(
    result.count,
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20
  );
  return success(res, { data: result.rows, meta });
});

export const getAdminTickets = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await supportTicketService.getAdminTickets(req.query);
  const meta = buildPaginationMeta(
    result.count,
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20
  );
  return success(res, { data: result.rows, meta });
});

export const getTicketDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = !!req.admin;
  const userId = isAdmin ? req.admin!.id : req.user!.id;
  const ticket = await supportTicketService.getTicketDetails(req.params.id as string, userId, isAdmin);
  return success(res, { data: ticket });
});

export const createTicket = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { subject, content } = req.body;
  const ticket = await supportTicketService.createTicket(req.user!.id, subject, content);
  return created(res, { data: ticket, message: 'تم فتح تذكرة الدعم بنجاح' });
});

export const addReplyUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { content } = req.body;
  const message = await supportTicketService.addReply(req.params.id as string, req.user!.id, 'user', content);
  return created(res, { data: message, message: 'تم إرسال الرد بنجاح' });
});

export const addReplyAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { content } = req.body;
  const message = await supportTicketService.addReply(
    req.params.id as string,
    req.admin!.id,
    'admin',
    content
  );
  return created(res, { data: message, message: 'تم إرسال الرد بنجاح' });
});

export const updateTicketStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const ticket = await supportTicketService.updateTicketStatus(req.params.id as string, status);
  return success(res, { data: ticket, message: 'تم تحديث حالة التذكرة بنجاح' });
});
