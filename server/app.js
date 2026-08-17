import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Just the app. Connecting to the database and listening on a port happen in
// server.js, so tests can import this without starting a server
const app = express();

// Hosts like Vercel sit behind a proxy, so the real client IP arrives in
// X-Forwarded-For. Without this the rate limiter sees every visitor as one IP
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// == MIDDLEWARE ==
// The live site and local dev. Every other Vercel URL is matched by the pattern
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'].filter(
  Boolean,
);

// Vercel gives each deployment its own subdomain, so previews and the git-main
// alias never match CLIENT_URL. Anchored to the account slug, not any vercel.app
const vercelPreview =
  /^https:\/\/to-do-tasks-[a-z0-9-]+-szstanton\.vercel\.app$/;

app.use(
  cors({
    origin(origin, callback) {
      // Requests with no origin are curl, health checks and server to server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || vercelPreview.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
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
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server error',
  });
});

export default app;
