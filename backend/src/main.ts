import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors';

import { db } from './database/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { userHasPermission } from './services/permissionService';
import roleRoutes from './routes/roleRoutes';
dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 30
    }
  })
);

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('IAM Backend is running 🚀');
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    await db.query('SELECT NOW()');
    console.log('✅ Database connection successful');

  } catch (error) {
    console.error('❌ Failed to connect to the database');
    console.error(error);
  }
});
