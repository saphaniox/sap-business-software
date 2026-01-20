import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import { validateCustomer } from '../middleware/validation.js';
import { createCustomer, getAllCustomers, getCustomer, updateCustomer, deleteCustomer, getCustomerPurchaseHistory } from '../controllers/customerController.js';

const router = express.Router();

// CRITICAL: tenantContext middleware ensures data isolation between businesses
router.post('/', authenticate, tenantContext, validateCustomer, createCustomer);
router.get('/', authenticate, tenantContext, getAllCustomers);
router.get('/:id', authenticate, tenantContext, getCustomer);
router.get('/:id/purchase-history', authenticate, tenantContext, getCustomerPurchaseHistory);
router.put('/:id', authenticate, tenantContext, validateCustomer, updateCustomer);
router.delete('/:id', authenticate, tenantContext, deleteCustomer);

export default router;
