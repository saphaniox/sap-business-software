import express from 'express';
import { 
  sendAccountApprovalEmail,
  sendAccountSuspensionEmail,
  sendNewFeaturesEmail,
  sendCustomEmail,
  getEmailLogs,
  testEmailConfig
} from '../controllers/emailController.js';
import { superAdminAuth } from '../middleware/superAdminAuth.js';
import { apiEndpointLimiter } from '../middleware/securityEnhancements.js';

const router = express.Router();

// All email routes require super admin authentication
router.use(superAdminAuth);

// Apply rate limiting to email endpoints
router.use(apiEndpointLimiter);

// Send account approval email
router.post('/send-approval', sendAccountApprovalEmail);

// Send account suspension email
router.post('/send-suspension', sendAccountSuspensionEmail);

// Send new features announcement
router.post('/send-features', sendNewFeaturesEmail);

// Send custom email
router.post('/send-custom', sendCustomEmail);

// Get email logs
router.get('/logs', getEmailLogs);

// Test email configuration
router.post('/test', testEmailConfig);

export default router;
