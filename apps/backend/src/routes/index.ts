import { Router } from 'express';

import authRoutes from './authRoutes';
import adminAuthRoutes from './adminAuthRoutes';
import userRoutes from './userRoutes';
import pdfRoutes from './pdfRoutes';
import searchRoutes from './searchRoutes';
import settingsRoutes from './settingsRoutes';

import subscriptionRoutes from './subscriptionRoutes';
import paymentRoutes from './paymentRoutes';
import supplierRoutes from './supplierRoutes';
import adminRoutes from './adminRoutes';
import processingRoutes from './processingRoutes';
import notificationRoutes from './notificationRoutes';
import healthRoutes from './healthRoutes';
import aiProviderRoutes from './aiProviderRoutes';
import supportChannelRoutes from './supportChannelRoutes';
import supportTicketRoutes from './supportTicketRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/users', userRoutes);
router.use('/pdf', pdfRoutes);
router.use('/search', searchRoutes);
router.use('/settings', settingsRoutes);

router.use('/subscriptions', subscriptionRoutes);
router.use('/payments', paymentRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/admin', adminRoutes);
router.use('/processing', processingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/health', healthRoutes);
router.use('/ai-providers', aiProviderRoutes);
router.use('/support-channels', supportChannelRoutes);
router.use('/support-tickets', supportTicketRoutes);

export default router;
