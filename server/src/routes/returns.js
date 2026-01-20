import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  createReturn, 
  getReturns, 
  getReturn, 
  approveReturn, 
  rejectReturn,
  deleteReturn 
} from '../controllers/returnController.js';

const router = express.Router();

// CRITICAL: tenantContext middleware ensures data isolation between businesses
import { tenantContext } from '../middleware/tenantContext.js';

// Create return request
router.post('/', authenticate, tenantContext, createReturn);

// Get all returns
router.get('/', authenticate, tenantContext, getReturns);

// Get single return
router.get('/:id', authenticate, getReturn);

// Approve return (admin/manager only)
router.put('/:id/approve', authenticate, authorize('admin', 'manager'), approveReturn);

// Reject return (admin/manager only)
router.put('/:id/reject', authenticate, authorize('admin', 'manager'), rejectReturn);

// Delete return (admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteReturn);

export default router;
