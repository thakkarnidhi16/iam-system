
import dotenv from 'dotenv';
import app from './app';
import { db } from './database/db';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, async () => {

  console.log(
    `Server is running on http://localhost:${PORT}`
  );

  try {

    await db.query('SELECT NOW()');

    console.log(
      '✅ Database connection successful'
    );

  } catch (error) {

    console.error(
      '❌ Failed to connect to the database'
    );

    console.error(error);
  }
});
