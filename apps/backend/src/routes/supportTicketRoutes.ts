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
import { runValidators } from '../utils/validate';
import { supportTicket as supportTicketRules } from '../validators';

const router = Router();

// User Routes
router.get(
  '/my-tickets',
  auth,
  runValidators(supportTicketRules.getUserTicketsRules),
  getUserTickets
);
router.post('/my-tickets', auth, runValidators(supportTicketRules.createTicketRules), createTicket);
router.get(
  '/my-tickets/:id',
  auth,
  runValidators(supportTicketRules.ticketIdRules),
  getTicketDetails
);
router.post(
  '/my-tickets/:id/reply',
  auth,
  runValidators(supportTicketRules.replyToTicketRules),
  addReplyUser
);

// Admin Routes
router.get(
  '/admin',
  adminAuth,
  adminOnly,
  runValidators(supportTicketRules.getAdminTicketsRules),
  getAdminTickets
);
router.get(
  '/admin/:id',
  adminAuth,
  adminOnly,
  runValidators(supportTicketRules.ticketIdRules),
  getTicketDetails
);
router.post(
  '/admin/:id/reply',
  adminAuth,
  adminOnly,
  runValidators(supportTicketRules.replyToTicketRules),
  addReplyAdmin
);
router.patch(
  '/admin/:id/status',
  adminAuth,
  adminOnly,
  runValidators(supportTicketRules.updateTicketStatusRules),
  updateTicketStatus
);

export default router;
