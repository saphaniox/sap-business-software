import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authenticateSuperAdmin } from '../middleware/superAdminAuth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import {
  createTicket,
  getTickets,
  updateTicket,
  addTicketMessage
} from '../controllers/supportTicketController.js';

const router = express.Router();

// Company routes
router.post('/', authenticate, tenantContext, createTicket);
router.get('/company', authenticate, tenantContext, getTickets);
router.post('/:ticketId/message', authenticate, addTicketMessage);

// Super admin routes
router.get('/all', authenticateSuperAdmin, getTickets);
router.put('/:ticketId/status', authenticateSuperAdmin, updateTicket);
router.post('/:ticketId/admin-message', authenticateSuperAdmin, addTicketMessage);

export default router;
