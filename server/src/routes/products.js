import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import { validateProduct } from '../middleware/validation.js';
import { createProduct, getAllProducts, updateProduct, deleteProduct, getProductDemand } from '../controllers/productController.js';

const router = express.Router();

// CRITICAL: tenantContext middleware ensures data isolation between businesses
router.post('/', authenticate, tenantContext, authorize('admin', 'manager'), validateProduct, createProduct);
router.get('/', authenticate, tenantContext, getAllProducts);
router.get('/demand', authenticate, tenantContext, getProductDemand);
router.put('/:id', authenticate, tenantContext, authorize('admin', 'manager'), validateProduct, updateProduct);
router.delete('/:id', authenticate, tenantContext, authorize('admin'), deleteProduct);

export default router;
