
import { describe, it, expect, vi } from 'vitest';

import { loginUser } from '../../src/services/authService';

import { db } from '../../src/database/db';

import argon2 from 'argon2';


describe('loginUser', () => {
  it('throws an error when the password is incorrect', async () => {

    // Pretend the database found the user
    vi.spyOn(db, 'query').mockResolvedValue({
      rows: [
        {
          id: 4,
          first_name: 'Nidhi',
          last_name: 'Thakkar',
          email: 'nidhi@email.com',
          password_hash: 'fake-password-hash'
        }
      ]
    } as any);


    // Pretend Argon2 says the password is incorrect
    vi.spyOn(argon2, 'verify')
      .mockResolvedValue(false);


    await expect(
      loginUser({
        email: 'nidhi@email.com',
        password: 'WrongPassword'
      })
    ).rejects.toThrow(
      'Invalid email or password'
    );

  });

  it('returns the user when the email and password are correct', async () => {

    // Fake database response
    vi.spyOn(db, 'query').mockResolvedValue({
      rows: [
        {
          id: 4,
          first_name: 'Nidhi',
          last_name: 'Thakkar',
          email: 'nidhi@email.com',
          password_hash: 'fake-password-hash'
        }
      ]
    } as any);


    // Fake Argon2 password verification
    vi.spyOn(argon2, 'verify')
      .mockResolvedValue(true);

    const result = await loginUser({
      email: 'nidhi@email.com',
      password: 'Password123'
    });


    expect(result).toEqual({
      id: 4,
      first_name: 'Nidhi23234',
      last_name: 'Thakkar',
      email: 'nidhi@email.com'
    });

  });

});

