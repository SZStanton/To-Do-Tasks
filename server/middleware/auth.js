import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { nextExpiry, needsRefresh } from '../config/retention.js';

// Push the account and everything it owns to the same new expiry date, so a
// task can never survive its owner. Skipped for the demo, which has no date
async function keepAlive(user) {
  if (user.isDemo || !needsRefresh(user.expiresAt)) return;

  const expiresAt = nextExpiry();

  await Promise.all([
    User.updateOne({ _id: user._id }, { expiresAt }),
    Task.updateMany({ user: user._id }, { expiresAt }),
  ]);

  user.expiresAt = expiresAt;
}

// Auth Check - Protected routes that require logged-in user
async function protect(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    await keepAlive(user);

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export default protect;
