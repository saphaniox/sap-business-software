import express from 'express';
import { createUser, getAllUsers, updateUserRole, updateUserPermissions, deleteUser, uploadProfilePicture, deleteProfilePicture, getProfilePicture, adminChangePassword, changeOwnPassword } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Admin only endpoints - CRITICAL: tenantContext ensures isolation
router.post('/', authenticate, tenantContext, authorize('admin'), createUser);
router.get('/', authenticate, tenantContext, authorize('admin'), getAllUsers);
router.put('/:id/role', authenticate, tenantContext, authorize('admin'), updateUserRole);
router.put('/:id/permissions', authenticate, tenantContext, authorize('admin'), updateUserPermissions);
router.delete('/:id', authenticate, tenantContext, authorize('admin'), deleteUser);
router.put('/:userId/password', authenticate, tenantContext, authorize('admin'), adminChangePassword);

// Profile picture endpoints (authenticated users can manage their own)
router.post('/profile-picture', authenticate, tenantContext, upload.single('profile_picture'), uploadProfilePicture);
router.delete('/profile-picture', authenticate, tenantContext, deleteProfilePicture);
router.get('/:userId/profile-picture', authenticate, tenantContext, getProfilePicture);

// Password change endpoint (authenticated users can change their own password)
router.put('/change-password', authenticate, changeOwnPassword);

export default router;
