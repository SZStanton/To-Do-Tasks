import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';
import jsonOnly from '../middleware/jsonOnly.js';
import { registerSchema, loginSchema } from '../validation/authSchemas.js';

const router = Router();

// Helper to create JWT
const createToken = user =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Remove password before sending user data back
const cleanUser = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  username: user.username,
});

// == REGISTER ==
router.post('/register', jsonOnly, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    // Zod has already trimmed and lowercased these
    const {
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      password: cleanPassword,
    } = parsed.data;

    // Check if user exists
    const exists = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });
    if (exists) {
      return res.status(409).json({
        message: 'Email or username already exists.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // Create user
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
    });

    const token = createToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: cleanUser(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Registration failed.' });
  }
});

// == LOGIN ==
router.post('/login', jsonOnly, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { identifier: cleanIdentifier, password: cleanPassword } =
      parsed.data;

    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid login details.' });
    }

    const validPassword = await bcrypt.compare(cleanPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid login details.' });
    }

    const token = createToken(user);

    return res.json({
      message: 'Logged in successfully.',
      token,
      user: cleanUser(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

// == CHECK SESSION ==
router.get('/me', protect, (req, res) => {
  res.json({ user: cleanUser(req.user) });
});

export default router;
