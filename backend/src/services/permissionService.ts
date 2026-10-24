import { db } from '../database/db';

export async function userHasPermission(
  userId: number,
  permissionName: string
): Promise<boolean> {

  const result = await db.query(
    `
    SELECT 1
    FROM users u
    JOIN user_roles ur
        ON u.id = ur.user_id
    JOIN roles r
        ON ur.role_id = r.id
    JOIN role_permissions rp
        ON r.id = rp.role_id
    JOIN permissions p
        ON rp.permission_id = p.id
    WHERE u.id = $1
      AND p.name = $2
    `,
    [userId, permissionName]
  );

  return result.rows.length > 0;
}