import { Router } from 'express';
import {
  getUserTickets,
  getAdminTickets,
  getTicketDetails,
  createTicket,
  addReplyUser,
  addReplyAdmin,
  updateTicketStatus,
} from '../controllers/SupportTicketController';
import { auth, adminAuth, adminOnly } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// User Routes
router.get('/my-tickets', auth, asyncHandler(getUserTickets));
router.post('/my-tickets', auth, asyncHandler(createTicket));
router.get('/my-tickets/:id', auth, asyncHandler(getTicketDetails));
router.post('/my-tickets/:id/reply', auth, asyncHandler(addReplyUser));

// Admin Routes
router.get('/admin', adminAuth, adminOnly, asyncHandler(getAdminTickets));
router.get('/admin/:id', adminAuth, adminOnly, asyncHandler(getTicketDetails));
router.post('/admin/:id/reply', adminAuth, adminOnly, asyncHandler(addReplyAdmin));
router.patch('/admin/:id/status', adminAuth, adminOnly, asyncHandler(updateTicketStatus));

export default router;
