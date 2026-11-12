import { Pool } from 'pg';
import { dbConfig } from './config';

export const db = new Pool(dbConfig);
