import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
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

    // Get permissions belonging to the user's roles
    const permissionResult = await db.query(
      `
      SELECT DISTINCT
        p.id,
        p.name,
        p.description
      FROM permissions p
      JOIN role_permissions rp
        ON p.id = rp.permission_id
      JOIN user_roles ur
        ON rp.role_id = ur.role_id
      WHERE ur.user_id = $1
      ORDER BY p.name
      `,
      [req.session.userId]
    );

    res.status(200).json({
      user,
      permissions: permissionResult.rows
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to retrieve current user'
    });
  }
}

export async function forgotPasswordController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        message: 'Email is required'
      });

      return;
    }

    await forgotPassword(email);

    /*
     * Always return the same response.
     *
     * We don't tell the user whether
     * the email exists.
     */
    res.status(200).json({
      message:
        'If an account exists with that email, a password reset link has been sent.'
    });

  } catch (error) {

    console.error(error);

    /*
     * Don't expose SMTP/database details
     * to the client.
     */
    res.status(500).json({
      message:
        'Unable to process password reset request'
    });
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const {
      token,
      newPassword
    } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        message:
          'Token and new password are required'
      });

      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        message:
          'New password must be at least 8 characters'
      });

      return;
    }

    await resetPassword(
      token,
      newPassword
    );

    res.status(200).json({
      message:
        'Password reset successfully'
    });

  } catch (error) {

    if (
      error instanceof Error &&
      error.message === 'INVALID_RESET_TOKEN'
    ) {

      res.status(400).json({
        message:
          'Invalid password reset token'
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === 'RESET_TOKEN_ALREADY_USED'
    ) {

      res.status(400).json({
        message:
          'Password reset token has already been used'
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === 'RESET_TOKEN_EXPIRED'
    ) {

      res.status(400).json({
        message:
          'Password reset token has expired'
      });

      return;
    }

    console.error(error);

    res.status(500).json({
      message:
        'Unable to reset password'
    });
  }
}