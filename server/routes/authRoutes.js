import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';
import jsonOnly from '../middleware/jsonOnly.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiters.js';
import { registerSchema, loginSchema } from '../validation/authSchemas.js';
import { nextExpiry } from '../config/retention.js';

const router = Router();

// One message for both failures on purpose, saying which was wrong would tell a
// stranger whether an account exists
const LOGIN_FAILED =
  'That username or password did not match. Please try again.';

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
router.post('/register', registerLimiter, jsonOnly, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    // Zod has trimmed all of these and lowercased the email
    const {
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      password: cleanPassword,
    } = parsed.data;

    // Both fields are stored lowercase, so a plain match is enough and it can
    // use the indexes, which a collation query cannot
    const clashes = await User.find({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    }).select('email username');

    const emailTaken = clashes.some(found => found.email === cleanEmail);
    const usernameTaken = clashes.some(
      found => found.username === cleanUsername,
    );

    if (emailTaken && usernameTaken) {
      return res.status(409).json({
        message: 'That email and username are both already taken.',
      });
    }

    if (emailTaken) {
      return res.status(409).json({
        message: 'That email is already registered.',
      });
    }

    if (usernameTaken) {
      return res.status(409).json({
        message: 'That username is already taken.',
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
      expiresAt: nextExpiry(),
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
router.post('/login', loginLimiter, jsonOnly, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { identifier: cleanIdentifier, password: cleanPassword } =
      parsed.data;

    // Zod lowercased the identifier, and both fields are stored lowercase
    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    });

    if (!user) {
      return res.status(401).json({ message: LOGIN_FAILED });
    }

    const validPassword = await bcrypt.compare(cleanPassword, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: LOGIN_FAILED });
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
