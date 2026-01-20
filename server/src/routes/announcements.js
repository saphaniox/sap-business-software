import express from 'express';
import { authenticateSuperAdmin } from '../middleware/superAdminAuth.js';
import {
  createAnnouncement,
  getAnnouncements,
  getCompanyAnnouncements,
  markAnnouncementRead,
  deleteAnnouncement
} from '../controllers/announcementController.js';

const router = express.Router();

// Super admin routes
router.post('/', authenticateSuperAdmin, createAnnouncement);
router.get('/', authenticateSuperAdmin, getAnnouncements);
router.delete('/:announcementId', authenticateSuperAdmin, deleteAnnouncement);

// Company routes (requires regular auth)
router.get('/company', getCompanyAnnouncements);
router.post('/:announcementId/read', markAnnouncementRead);

export default router;
