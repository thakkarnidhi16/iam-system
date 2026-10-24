
import express from 'express';
import session from 'express-session';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';

const app = express();

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
    secret:
      process.env.SESSION_SECRET ||
      'development-secret',

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

export default app;

