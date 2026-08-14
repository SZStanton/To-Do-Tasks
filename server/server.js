import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Hosts like Vercel sit behind a proxy, so the real client IP arrives in
// X-Forwarded-For. Without this the rate limiter sees every visitor as one IP
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// == MIDDLEWARE ==
// Allow frontend requests and read JSON bodies
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());

// == ROUTES ==
// Test route to see if server is running
app.get('/', (req, res) => {
  res.json({ message: 'To-Do List API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
