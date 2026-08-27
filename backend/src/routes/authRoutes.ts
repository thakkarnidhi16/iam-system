import { Router } from 'express';

import { requireAuth } from '../middleware/authMiddleware';

import {
  register,
  login,
  changePassword,
  getMe,
  logout
} from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.post(
  '/logout',
  requireAuth,
  logout
);

router.post(
  '/change-password',
  requireAuth,
  changePassword
);

router.get(
  '/me',
  requireAuth,
  getMe
);

export default router;