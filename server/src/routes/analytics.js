import express from 'express';
import { superAdminAuth } from '../middleware/superAdminAuth.js';
import {
  trackPageVisit,
  updateSession,
  getAnalyticsOverview,
  getRecentVisitors,
  getPopularPages,
  getDeviceStats
} from '../controllers/analyticsController.js';

const router = express.Router();

// Public endpoint - track page visits (no auth required for tracking)
router.post('/track', trackPageVisit);
router.post('/session/update', updateSession);

// Super Admin only endpoints
router.get('/overview', superAdminAuth, getAnalyticsOverview);
router.get('/visitors', superAdminAuth, getRecentVisitors);
router.get('/pages', superAdminAuth, getPopularPages);
router.get('/devices', superAdminAuth, getDeviceStats);

export default router;
