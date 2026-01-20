import express from 'express';
import {
  getAllCompanies,
  getCompanyById,
  suspendCompany,
  activateCompany,
  blockCompany,
  deleteCompany,
  getDashboardStats,
  getAuditLogs
} from '../controllers/companyManagementController.js';
import { superAdminAuth } from '../middleware/superAdminAuth.js';

const router = express.Router();

// All routes require super admin authentication
router.use(superAdminAuth);

// Dashboard and statistics
router.get('/dashboard/stats', getDashboardStats);
router.get('/audit-logs', getAuditLogs);

// Company management
router.get('/companies', getAllCompanies);
router.get('/companies/:id', getCompanyById);
router.put('/companies/:id/suspend', suspendCompany);
router.put('/companies/:id/activate', activateCompany);
router.put('/companies/:id/block', blockCompany);
router.delete('/companies/:id', deleteCompany);

export default router;
