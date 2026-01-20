import express from 'express';
import {
  superAdminLogin,
  getCurrentSuperAdmin,
  superAdminLogout,
  createSuperAdmin,
  getAllSuperAdmins,
  updateSuperAdmin,
  getPendingCompanies,
  approveCompany,
  rejectCompany,
  getAllUsersAcrossBusinesses,
  getAllCompanies,
  blockCompany,
  suspendCompany,
  banCompany,
  reactivateCompany,
  deleteCompany,
  deleteUser,
  getCompanyProfile,
  getPlatformStatistics
} from '../controllers/superAdminController.js';
import { 
  getAuditLogs, 
  getTargetAuditLogs, 
  getAuditStats 
} from '../controllers/auditLogController.js';
import { superAdminAuth } from '../middleware/superAdminAuth.js';

const router = express.Router();

// Public routes
router.post('/login', superAdminLogin);

// Protected routes
router.get('/me', superAdminAuth, getCurrentSuperAdmin);
router.post('/logout', superAdminAuth, superAdminLogout);
router.post('/admins', superAdminAuth, createSuperAdmin);
router.get('/admins', superAdminAuth, getAllSuperAdmins);
router.put('/admins/:id', superAdminAuth, updateSuperAdmin);

// Company approval routes
router.get('/pending-companies', superAdminAuth, getPendingCompanies);
router.post('/companies/:companyId/approve', superAdminAuth, approveCompany);
router.post('/companies/:companyId/reject', superAdminAuth, rejectCompany);

// Company management routes
router.get('/companies', superAdminAuth, getAllCompanies);
router.post('/companies/:companyId/block', superAdminAuth, blockCompany);
router.post('/companies/:companyId/suspend', superAdminAuth, suspendCompany);
router.post('/companies/:companyId/ban', superAdminAuth, banCompany);
router.post('/companies/:companyId/reactivate', superAdminAuth, reactivateCompany);
router.delete('/companies/:companyId', superAdminAuth, deleteCompany);
router.get('/companies/:companyId/profile', superAdminAuth, getCompanyProfile);

// Platform statistics
router.get('/statistics', superAdminAuth, getPlatformStatistics);

// User management routes
router.get('/all-users', superAdminAuth, getAllUsersAcrossBusinesses);
router.delete('/users/:userId', superAdminAuth, deleteUser);

// Audit log routes
router.get('/audit-logs', superAdminAuth, getAuditLogs);
router.get('/audit-logs/target/:targetId', superAdminAuth, getTargetAuditLogs);
router.get('/audit-logs/stats', superAdminAuth, getAuditStats);

export default router;
