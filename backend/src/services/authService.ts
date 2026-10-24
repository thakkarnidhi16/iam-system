import argon2 from 'argon2';
import { db } from '../database/db';
import { sendPasswordResetEmail } from './emailService';
import { randomBytes, createHash } from 'crypto';

interface RegisterUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginUser {
  email: string;
  password: string;
}

export async function registerUser(user: RegisterUser) {

  const existingUser = await db.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
    `,
    [user.email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('Email already exists');
  }

  const passwordHash = await argon2.hash(user.password);

  const result = await db.query(
    `
    INSERT INTO users
    (
      first_name,
      last_name,
      email,
      password_hash
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4
    )
    RETURNING
      id,
      first_name,
      last_name,
      email
    `,
    [
      user.firstName,
      user.lastName,
      user.email,
      passwordHash
    ]
  );

  return result.rows[0];
}


export async function loginUser(user: LoginUser) {

  const result = await db.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      password_hash
    FROM users
    WHERE email = $1
    `,
    [user.email]
  );

  // User does not exist
  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const existingUser = result.rows[0];

  // Compare entered password with stored hash
  const validPassword = await argon2.verify(
    existingUser.password_hash,
    user.password
  );

  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  // Don't return password_hash
  return {
    id: existingUser.id,
    first_name: existingUser.first_name,
    last_name: existingUser.last_name,
    email: existingUser.email
  };
}

export async function forgotPassword(
  email: string
): Promise<void> {

  // Find the user
  const result = await db.query(
    `
    SELECT id, email
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  const user = result.rows[0];

  /*
   * Do not reveal whether the email exists.
   *
   * The controller will return the same response
   * whether the user exists or not.
   */
  if (!user) {
    return;
  }

  // Generate a secure random token
  const resetToken = randomBytes(32).toString('hex');

  // Hash the token before storing it
const tokenHash = createHash('sha256')
  .update(resetToken)
  .digest('hex');

  // Token expires in 30 minutes
  const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000
  );

  /*
   * Remove any previous reset token
   * for this user.
   */
  await db.query(
    `
    DELETE FROM password_reset_tokens
    WHERE user_id = $1
    `,
    [user.id]
  );

  /*
   * Store only the hashed token.
   */
  await db.query(
    `
    INSERT INTO password_reset_tokens
      (user_id, token_hash, expires_at)
    VALUES
      ($1, $2, $3)
    `,
    [
      user.id,
      tokenHash,
      expiresAt
    ]
  );

  /*
   * Send the original token by email.
   *
   * The database only contains tokenHash.
   */
  await sendPasswordResetEmail(
    user.email,
    resetToken
  );
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {

  // Hash the token received from the user
  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex');

  // Find the reset token
  const result = await db.query(
    `
    SELECT
      id,
      user_id,
      expires_at,
      used_at
    FROM password_reset_tokens
    WHERE token_hash = $1
    `,
    [tokenHash]
  );

  const resetToken = result.rows[0];

  // Token does not exist
  if (!resetToken) {
    throw new Error('INVALID_RESET_TOKEN');
  }

  // Token has already been used
  if (resetToken.used_at) {
    throw new Error('RESET_TOKEN_ALREADY_USED');
  }

  // Token has expired
  if (new Date(resetToken.expires_at) < new Date()) {
    throw new Error('RESET_TOKEN_EXPIRED');
  }

  // Hash the new password using your existing Argon2 setup
  const passwordHash = await argon2.hash(
    newPassword
  );

  /*
   * Update the password and password_changed_at
   */
  await db.query(
    `
    UPDATE users
    SET
      password_hash = $1,
      password_changed_at = CURRENT_TIMESTAMP
    WHERE id = $2
    `,
    [
      passwordHash,
      resetToken.user_id
    ]
  );

  /*
   * Mark the reset token as used.
   */
  await db.query(
    `
    UPDATE password_reset_tokens
    SET used_at = CURRENT_TIMESTAMP
    WHERE id = $1
    `,
    [resetToken.id]
  );
}