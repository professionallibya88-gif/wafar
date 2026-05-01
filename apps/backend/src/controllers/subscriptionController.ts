import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/ApiResponse';
import { subscriptionService } from '../services/SubscriptionService';
import { AuthenticatedRequest } from '../types';

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await subscriptionService.listPlans();
  return success(res, { data: plans });
});

export const getMyActiveSubscription = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user ? req.user.id : undefined;
    if (!userId) return success(res, { data: null });
    const subscription = await subscriptionService.getMyActiveSubscription(userId);
    return success(res, { data: subscription });
  }
);

export const listMySubscriptions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user ? req.user.id : undefined;
    if (!userId) return success(res, { data: [] });
    const subscriptions = await subscriptionService.listMySubscriptions(userId);
    return success(res, { data: subscriptions });
  }
);
