import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import {
  processDocument,
  getDocuments,
  deleteDocument
} from '../controllers/documentProcessingController.js';

const router = express.Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(tenantContext);

// Upload and process document
router.post('/upload', processDocument);

// Get processing history
router.get('/history', getDocuments);

// Delete document
router.delete('/:documentId', deleteDocument);

export default router;
