import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { authenticateDownload } from '../middleware/downloadAuth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import { generateInvoice, getInvoices, updateInvoice, deleteInvoice, downloadInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

// CRITICAL: tenantContext middleware ensures data isolation between businesses
router.post('/generate', authenticate, tenantContext, authorize('admin', 'manager', 'sales'), generateInvoice);
router.get('/', authenticate, tenantContext, getInvoices);
router.get('/:id/download', authenticateDownload, tenantContext, downloadInvoice);
router.put('/:id', authenticate, tenantContext, authorize('admin', 'manager', 'sales'), updateInvoice);
router.delete('/:id', authenticate, tenantContext, authorize('admin'), deleteInvoice);

export default router;
