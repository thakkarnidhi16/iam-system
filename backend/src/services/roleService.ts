import { db } from '../database/db';

export async function getAllRoles() {

  const result = await db.query(
    `
    SELECT
      id,
      name,
      description,
      created_at
    FROM roles
    ORDER BY id;
    `
  );

  return result.rows;
}

export async function getRolePermissions(roleId: number) {

  const result = await db.query(
    `
    SELECT
      p.id,
      p.name,
      p.description
    FROM role_permissions rp
    JOIN permissions p
      ON rp.permission_id = p.id
    WHERE rp.role_id = $1
    ORDER BY p.id;
    `,
    [roleId]
  );

  return result.rows;
}

export async function assignPermissionToRole(
  roleId: number,
  permissionId: number
) {

  const result = await db.query(
    `
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES ($1, $2)
    RETURNING role_id, permission_id;
    `,
    [roleId, permissionId]
  );

  return result.rows[0];
}

export async function removePermissionFromRole(
  roleId: number,
  permissionId: number
) {

  const result = await db.query(
    `
    DELETE FROM role_permissions
    WHERE role_id = $1
      AND permission_id = $2
    RETURNING role_id, permission_id;
    `,
    [roleId, permissionId]
  );

  return result.rows[0];
}

export async function assignRoleToUser(
  userId: number,
  roleId: number
): Promise<void> {

  await db.query(
    `
    INSERT INTO user_roles (user_id, role_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, role_id)
    DO NOTHING
    `,
    [userId, roleId]
  );
}