import { Router } from 'express';

import {
  getRoles,
  getRolePermissionsController,
  assignPermissionController,
  removePermissionController
} from '../controllers/roleController';

import { requireAuth } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionMiddleware';

const router = Router();

router.get(
  '/',
  requireAuth,
  requirePermission('view_users'),
  getRoles
);

router.get(
  '/:id/permissions',
  requireAuth,
  requirePermission('view_users'),
  getRolePermissionsController
);

router.post(
  '/:id/permissions',
  requireAuth,
  requirePermission('assign_permissions'),
  assignPermissionController
);

router.delete(
  '/:id/permissions/:permissionId',
  requireAuth,
  requirePermission('assign_permissions'),
  removePermissionController
);
export default router;