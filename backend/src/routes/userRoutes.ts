import { Router } from 'express';

import {
  getMe,
  getUsers,
  getUserByIdController,
  updateUserController,
  deleteUserController,
  assignRoleController,
  getUserRolesController,
  removeRoleController,
  createUser
} from '../controllers/userController';

import {
  assignRoleToUserController
} from '../controllers/roleController';

import { requireAuth } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionMiddleware';
const router = Router();

router.get(
  '/me',
  requireAuth,
  getMe
);

router.get(
  '/',
  requireAuth,
  requirePermission('view_users'),
  getUsers
);

router.get(
  '/:id',
  requireAuth,
  requirePermission('view_users'),
  getUserByIdController
);

router.post(
  '/',
  requireAuth,
  requirePermission('create_users'),
  createUser
);

router.patch(
  '/:id',
  requireAuth,
  requirePermission('update_users'),
  updateUserController
);

router.delete(
  '/:id',
  requireAuth,
  requirePermission('delete_users'),
  deleteUserController
);

router.post(
  '/:id/roles',
  requireAuth,
  requirePermission('assign_roles'),
  assignRoleController
);

router.get(
  '/:id/roles',
  requireAuth,
  requirePermission('view_users'),
  getUserRolesController
);

router.delete(
  '/:id/roles/:roleId',
  requireAuth,
  requirePermission('assign_roles'),
  removeRoleController
);

router.post(
  '/:userId/roles',
  requireAuth,
  requirePermission('assign_roles'),
  assignRoleToUserController
);


export default router;