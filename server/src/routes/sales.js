import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { authenticateDownload } from '../middleware/downloadAuth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import { validateSalesOrder } from '../middleware/validation.js';
import { createSalesOrder, getSalesOrders, getSalesOrder, updateSalesOrder, deleteSalesOrder, downloadSalesOrder } from '../controllers/salesController.js';

const router = express.Router();

// CRITICAL: tenantContext middleware ensures data isolation between businesses
router.post('/', authenticate, tenantContext, validateSalesOrder, createSalesOrder);
router.get('/', authenticate, tenantContext, getSalesOrders);
router.get('/:id', authenticate, tenantContext, getSalesOrder);
router.get('/:id/download', authenticateDownload, tenantContext, downloadSalesOrder);
router.put('/:id', authenticate, tenantContext, authorize('admin', 'manager', 'sales'), updateSalesOrder);
router.delete('/:id', authenticate, tenantContext, authorize('admin'), deleteSalesOrder);

export default router;
