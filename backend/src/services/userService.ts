import argon2 from 'argon2';
import { db } from '../database/db';


export async function getAllUsers() {

  const result = await db.query(`
    SELECT
      id,
      first_name,
      last_name,
      email,
      created_at
    FROM users
    ORDER BY id;
  `);

  return result.rows;
}


export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {

  // Hash password
  const passwordHash = await argon2.hash(password);

  // Create user
  const userResult = await db.query(
    `
    INSERT INTO users
      (first_name, last_name, email, password_hash)
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      id,
      first_name,
      last_name,
      email,
      created_at;
    `,
    [
      firstName,
      lastName,
      email,
      passwordHash
    ]
  );

  const user = userResult.rows[0];

  // Assign default User role
  await db.query(
    `
    INSERT INTO user_roles
      (user_id, role_id)
    VALUES
      ($1, $2);
    `,
    [
      user.id,
      4
    ]
  );

  return user;
}

export async function getUserById(userId: number) {

  const result = await db.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      created_at
    FROM users
    WHERE id = $1;
    `,
    [userId]
  );

  return result.rows[0];
}

export async function updateUser(
  userId: number,
  firstName: string,
  lastName: string,
  email: string
) {

  const result = await db.query(
    `
    UPDATE users
    SET
      first_name = $1,
      last_name = $2,
      email = $3
    WHERE id = $4
    RETURNING
      id,
      first_name,
      last_name,
      email,
      created_at;
    `,
    [
      firstName,
      lastName,
      email,
      userId
    ]
  );

  return result.rows[0];
}

export async function deleteUser(userId: number) {

  const result = await db.query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING
      id,
      first_name,
      last_name,
      email;
    `,
    [userId]
  );

  return result.rows[0];
}

export async function assignRoleToUser(
  userId: number,
  roleId: number
) {

  const result = await db.query(
    `
    INSERT INTO user_roles (user_id, role_id)
    VALUES ($1, $2)
    RETURNING user_id, role_id;
    `,
    [userId, roleId]
  );

  return result.rows[0];
}

export async function getUserRoles(userId: number) {

  const result = await db.query(
    `
    SELECT
      r.id,
      r.name,
      r.description
    FROM user_roles ur
    JOIN roles r
      ON ur.role_id = r.id
    WHERE ur.user_id = $1
    ORDER BY r.id;
    `,
    [userId]
  );

  return result.rows;
}

export async function removeRoleFromUser(
  userId: number,
  roleId: number
) {

  const result = await db.query(
    `
    DELETE FROM user_roles
    WHERE user_id = $1
      AND role_id = $2
    RETURNING user_id, role_id;
    `,
    [userId, roleId]
  );

  return result.rows[0];
}

export async function changeUserPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<void> {

  const result = await db.query(
    `
    SELECT password_hash
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const passwordIsValid = await argon2.verify(
    user.password_hash,
    currentPassword
  );

  if (!passwordIsValid) {
    throw new Error('INVALID_CURRENT_PASSWORD');
  }

  const newPasswordHash = await argon2.hash(
    newPassword
  );

  await db.query(
    `
    UPDATE users
    SET password_hash = $1
    WHERE id = $2
    `,
    [newPasswordHash, userId]
  );
}
