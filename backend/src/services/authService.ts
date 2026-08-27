import argon2 from 'argon2';
import { db } from '../database/db';

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