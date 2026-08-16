import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import connectDB from '../config/db.js';
import { resetDemoTasks } from '../config/demo.js';
import User from '../models/User.js';

dotenv.config();

// Creates or updates the shared demo account. Safe to run as often as you like,
// and worth rerunning if the database is ever cleared. See the README.
async function seedDemo() {
  const username = (process.env.DEMO_USERNAME || '').trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD;

  if (!username || !password) {
    console.error('Set DEMO_USERNAME and DEMO_PASSWORD in server/.env first.');
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { username },
    {
      $set: {
        name: 'Demo User',
        email: `${username}@example.com`,
        username,
        password: await bcrypt.hash(password, 10),
        isDemo: true,
      },
      // Explicitly cleared, a date here would let the TTL delete the demo
      $unset: { expiresAt: '' },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await resetDemoTasks(user._id);

  console.log(`Demo account ready: ${username}`);
  await mongoose.connection.close();
}

seedDemo().catch(async error => {
  console.error('Seeding the demo account failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
