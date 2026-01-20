import express from 'express';
import { authenticateSuperAdmin } from '../middleware/superAdminAuth.js';
import {
  getSettings,
  updateSetting
} from '../controllers/platformSettingsController.js';

const router = express.Router();

// All routes require super admin authentication
router.get('/', authenticateSuperAdmin, getSettings);
router.put('/', authenticateSuperAdmin, updateSetting);

export default router;
