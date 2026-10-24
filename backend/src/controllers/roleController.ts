import { Request, Response } from 'express';

import {
  getAllRoles,
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole
} from '../services/roleService';

import {
  assignRoleToUser
} from '../services/roleService';

export async function getRoles(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const roles = await getAllRoles();

    res.status(200).json({
      roles
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to retrieve roles'
    });

  }
}

export async function getRolePermissionsController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const roleId = Number(req.params.id);

    if (!Number.isInteger(roleId)) {

      res.status(400).json({
        message: 'Invalid role ID'
      });

      return;
    }

    const permissions = await getRolePermissions(roleId);

    res.status(200).json({
      roleId,
      permissions
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to retrieve role permissions'
    });

  }
}

export async function assignPermissionController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const roleId = Number(req.params.id);
    const permissionId = Number(req.body.permissionId);

    if (!Number.isInteger(roleId)) {

      res.status(400).json({
        message: 'Invalid role ID'
      });

      return;
    }

    if (!Number.isInteger(permissionId)) {

      res.status(400).json({
        message: 'Invalid permission ID'
      });

      return;
    }

    const relationship = await assignPermissionToRole(
      roleId,
      permissionId
    );

    res.status(201).json({
      message: 'Permission assigned successfully',
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
          message: 'Role or permission does not exist'
        });

        return;
      }

      if (error.code === '23505') {

        res.status(409).json({
          message: 'Permission is already assigned to this role'
        });

        return;
      }
    }

    res.status(500).json({
      message: 'Failed to assign permission'
    });

  }
}

export async function removePermissionController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const roleId = Number(req.params.id);
    const permissionId = Number(req.params.permissionId);

    if (!Number.isInteger(roleId)) {

      res.status(400).json({
        message: 'Invalid role ID'
      });

      return;
    }

    if (!Number.isInteger(permissionId)) {

      res.status(400).json({
        message: 'Invalid permission ID'
      });

      return;
    }

    const relationship = await removePermissionFromRole(
      roleId,
      permissionId
    );

    if (!relationship) {

      res.status(404).json({
        message: 'Permission is not assigned to this role'
      });

      return;
    }

    res.status(200).json({
      message: 'Permission removed successfully',
      relationship
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to remove permission'
    });

  }
}

export async function assignRoleToUserController(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const userId = Number(req.params.userId);
    const { roleId } = req.body;

    if (!userId || !roleId) {
      res.status(400).json({
        message: 'userId and roleId are required'
      });

      return;
    }

    await assignRoleToUser(
      userId,
      Number(roleId)
    );

    res.status(201).json({
      message: 'Role assigned successfully'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Failed to assign role'
    });

  }
}

