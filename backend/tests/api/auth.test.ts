
import { describe, it, expect } from 'vitest';
import request from 'supertest';

import app from '../../src/app';


describe('POST /auth/login', () => {

  it('logs in successfully with valid credentials', async () => {

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'akash@gmail.com',
        password: 'akash'
      });


    expect(response.status).toBe(200);

    expect(response.body.message)
      .toBe('Login successful');

    expect(response.body.user)
      .toBeDefined();

    expect(response.body.user.email)
      .toBe('akash@gmail.com');

  });

  
  it('rejects login with an incorrect password', async () => {

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'akash@gmail.com',
        password: 'wrong-password'
      });


    expect(response.status).toBe(401);

    expect(response.body.message)
      .toBe('Invalid email or password');

  });


    it('returns the logged-in user from the session', async () => {
    const agent = request.agent(app);

    await agent
        .post('/auth/login')
        .send({
        email: 'akash@gmail.com',
        password: 'akash'
        });

    const response = await agent.get('/auth/me');

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('akash@gmail.com');
    });



});

