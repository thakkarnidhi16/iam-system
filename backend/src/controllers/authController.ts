import { Request, Response } from 'express';
import {
  registerUser,
  loginUser
} from '../services/authService';

import { db } from '../database/db';

import {
  changeUserPassword
} from '../services/userService';

export async function register(
  req: Request,
  res: Response
): Promise<void> {

  try {
    const {
      firstName,
      lastName,
      email,
      password
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        message: 'All fields are required'
      });
      return;
    }

    const user = await registerUser({
      firstName,
      lastName,
      email,
      password
    });

    res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (error) {

    console.error(error);

    if (
      error instanceof Error &&
      error.message === 'Email already exists'
    ) {
      res.status(409).json({
        message: 'Email already exists'
      });
      return;
    }

    res.status(500).json({
      message: 'Something went wrong'
    });
  }
}


export async function login(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const {
      email,
      password
    } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({
        message: 'Email and password are required'
      });
      return;
    }

    // Call login service
    const user = await loginUser({
      email,
      password
    });

    // Store authenticated user in session
    req.session.userId = user.id;

    res.status(200).json({
    message: 'Login successful',
    user
    });

  } catch (error) {

    console.error(error);

    if (
      error instanceof Error &&
      error.message === 'Invalid email or password'
    ) {
      res.status(401).json({
        message: 'Invalid email or password'
      });
      return;
    }

    res.status(500).json({
      message: 'Something went wrong'
    });
  }
}

export function logout(
  req: Request,
  res: Response
): void {

  req.session.destroy((error) => {

    if (error) {

      console.error(error);

      res.status(500).json({
        message: 'Failed to logout'
      });

      return;
    }

    res.clearCookie('connect.sid');

    res.status(200).json({
      message: 'Logged out successfully'
    });
  });
}

export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {

  try {

    if (!req.session.userId) {

      res.status(401).json({
        message: 'Authentication required'
      });

      return;
    }

    const {
      currentPassword,
      newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {

      res.status(400).json({
        message: 'Current password and new password are required'
      });

      return;
    }

    if (newPassword.length < 8) {

      res.status(400).json({
        message: 'New password must be at least 8 characters'
      });

      return;
    }

    await changeUserPassword(
      req.session.userId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {

    if (
      error instanceof Error &&
      error.message === 'INVALID_CURRENT_PASSWORD'
    ) {

      res.status(401).json({
        message: 'Current password is incorrect'
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === 'USER_NOT_FOUND'
    ) {

      res.status(404).json({
        message: 'User not found'
      });

      return;
    }

    console.error(error);

    res.status(500).json({
      message: 'Failed to change password'
    });
  }
}

export async function getMe(
  req: Request,
  res: Response
): Promise<void> {

  try {

    if (!req.session.userId) {

      res.status(401).json({
        message: 'Authentication required'
      });

      return;
    }

    const result = await db.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        created_at
      FROM users
      WHERE id = $1
      `,
      [req.session.userId]
    );

    const user = result.rows[0];

    if (!user) {

      res.status(404).json({
        message: 'User not found'
      });

      return;
    }

    res.status(200).json({
      user
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to retrieve current user'
    });
  }
}