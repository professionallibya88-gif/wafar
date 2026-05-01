import { Response, Request } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/ApiResponse';
import { supportChannelService } from '../services/SupportChannelService';
import { AuthenticatedRequest } from '../types';

export const getAllChannels = asyncHandler(async (req: Request, res: Response) => {
  const channels = await supportChannelService.getAllChannels();
  return success(res, { data: channels });
});

export const getActiveChannels = asyncHandler(async (req: Request, res: Response) => {
  const channels = await supportChannelService.getActiveChannels();
  return success(res, { data: channels });
});

export const createChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const channel = await supportChannelService.createChannel(req.body);
  return created(res, { data: channel, message: 'تم إنشاء قناة الدعم بنجاح' });
});

export const updateChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const channel = await supportChannelService.updateChannel(id, req.body);
  return success(res, { data: channel, message: 'تم تحديث قناة الدعم بنجاح' });
});

export const deleteChannel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await supportChannelService.deleteChannel(id);
  return success(res, { message: 'تم حذف قناة الدعم بنجاح' });
});

export const toggleActive = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const channel = await supportChannelService.toggleActive(id);
  return success(res, { data: channel, message: 'تم تغيير حالة قناة الدعم بنجاح' });
});
