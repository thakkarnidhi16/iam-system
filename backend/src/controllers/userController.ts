import { Request, Response } from 'express';

import { db } from '../database/db';

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignRoleToUser,
  getUserRoles,
  removeRoleFromUser,
  createUser as createUserService
} from '../services/userService';

export async function getMe(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const userId = req.session.userId;

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
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: 'User not found'
      });

      return;
    }

    res.status(200).json({
      user: result.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to retrieve user'
    });

  }
}

export async function getUsers(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const users = await getAllUsers();

    res.status(200).json({
      users
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to retrieve users'
    });

  }
}


export async function createUser(
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

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {

      res.status(400).json({
        message: 'All fields are required'
      });

      return;
    }

    const user = await createUserService(
      firstName,
      lastName,
      email,
      password
    );

    res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {

  console.error(error);

  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === '23505'
  ) {

    res.status(409).json({
      message: 'Email already exists'
    });

    return;
  }

  res.status(500).json({
    message: 'Failed to create user'
  });

}
}

export async function getUserByIdController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {

      res.status(400).json({
        message: 'Invalid user ID'
      });

      return;
    }

    const user = await getUserById(userId);

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
      message: 'Failed to retrieve user'
    });

  }
}

export async function updateUserController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {

      res.status(400).json({
        message: 'Invalid user ID'
      });

      return;
    }

    const {
      firstName,
      lastName,
      email
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email
    ) {

      res.status(400).json({
        message: 'firstName, lastName and email are required'
      });

      return;
    }

    const user = await updateUser(
      userId,
      firstName,
      lastName,
      email
    );

    if (!user) {

      res.status(404).json({
        message: 'User not found'
      });

      return;
    }

    res.status(200).json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {

    console.error(error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {

      res.status(409).json({
        message: 'Email already exists'
      });

      return;
    }

    res.status(500).json({
      message: 'Failed to update user'
    });
  }
}

export async function deleteUserController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {

      res.status(400).json({
        message: 'Invalid user ID'
      });

      return;
    }

    const user = await deleteUser(userId);

    if (!user) {

      res.status(404).json({
        message: 'User not found'
      });

      return;
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to delete user'
    });

  }
}

export async function assignRoleController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const userId = Number(req.params.id);
    const roleId = Number(req.body.roleId);

    if (!Number.isInteger(userId)) {

      res.status(400).json({
        message: 'Invalid user ID'
      });

      return;
    }

    if (!Number.isInteger(roleId)) {

      res.status(400).json({
        message: 'Invalid role ID'
      });

      return;
    }

    const relationship = await assignRoleToUser(
      userId,
      roleId
    );

    res.status(201).json({
      message: 'Role assigned successfully',
      relationship
    });

  } catch (error) {

    console.error(error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error
    ) {

      if (error.code === '23503') {

        res.status(404).json({
          message: 'User or role does not exist'
        });

        return;
      }

      if (error.code === '23505') {

        res.status(409).json({
          message: 'Role is already assigned to this user'
        });

        return;
      }
    }

    res.status(500).json({
      message: 'Failed to assign role'
    });

  }
}

export async function getUserRolesController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {

      res.status(400).json({
        message: 'Invalid user ID'
      });

      return;
    }

    const roles = await getUserRoles(userId);

    res.status(200).json({
      userId,
      roles
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to retrieve user roles'
    });

  }
}

export async function removeRoleController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const userId = Number(req.params.id);
    const roleId = Number(req.params.roleId);

    if (!Number.isInteger(userId)) {

      res.status(400).json({
        message: 'Invalid user ID'
      });

      return;
    }

    if (!Number.isInteger(roleId)) {

      res.status(400).json({
        message: 'Invalid role ID'
      });

      return;
    }

    const relationship = await removeRoleFromUser(
      userId,
      roleId
    );

    if (!relationship) {

      res.status(404).json({
        message: 'Role is not assigned to this user'
      });

      return;
    }

    res.status(200).json({
      message: 'Role removed successfully',
      relationship
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to remove role'
    });

  }
}
