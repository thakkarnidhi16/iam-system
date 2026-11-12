import fs from 'fs';
import dotenv from 'dotenv';
import type { PoolConfig } from 'pg';

dotenv.config();

// DB_SSL=true is required for AWS RDS.
// DB_SSL_CA points to the RDS certificate bundle (global-bundle.pem)
// so the server's identity is verified.
const ssl =
  process.env.DB_SSL === 'true'
    ? {
        ca: process.env.DB_SSL_CA
          ? fs.readFileSync(process.env.DB_SSL_CA, 'utf8')
          : undefined
      }
    : undefined;

export const dbConfig: PoolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl
};
