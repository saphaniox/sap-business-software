import express from 'express';
import { 
  registerCompany, 
  getCompany, 
  updateCompany,
  getAllCompanies,
  getCompanySettings,
  updateCompanySettings,
  uploadCompanyLogo,
  deleteCompanyLogo,
  getCompanyLogo,
  getIndustryFeaturesEndpoint
} from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes - no authentication required
router.post('/register', registerCompany);
router.get('/industry-features', getIndustryFeaturesEndpoint);

// Protected routes - require authentication
router.get('/me', authenticate, getCompany);
router.put('/me', authenticate, updateCompany);

// Company settings/profile routes
router.get('/settings', authenticate, tenantContext, getCompanySettings);
router.put('/settings', authenticate, tenantContext, updateCompanySettings);

// Company logo routes
router.post('/logo', authenticate, tenantContext, upload.single('logo'), uploadCompanyLogo);
router.delete('/logo', authenticate, tenantContext, deleteCompanyLogo);
router.get('/logo', authenticate, tenantContext, getCompanyLogo);

// Super admin only
router.get('/all', authenticate, getAllCompanies);

export default router;
