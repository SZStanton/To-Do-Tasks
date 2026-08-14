import { z } from 'zod';

// Emails are lowercased so lookups match regardless of how they were typed
const emailField = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .pipe(z.email('Please enter a valid email address.'));

// Case is kept, this is a display name. Registration checks for clashes
// case-insensitively so 'Jordan Blake' and 'jordan blake' cannot both exist
const usernameField = z
  .string({ error: 'Username is required.' })
  .trim()
  .min(3, 'Username must be at least 3 characters.')
  .max(30, 'Username must be 30 characters or less.')
  .regex(
    /^[\p{L}\p{N} '_-]+$/u,
    'Username can only contain letters, numbers, spaces, apostrophes, hyphens and underscores.',
  )
  // Collapse double spaces so 'Jordan  Blake' cannot sit next to 'Jordan Blake'
  .transform(value => value.replace(/\s+/g, ' '));

// 72 is bcrypt's limit. Anything longer is silently truncated, so reject it instead
const passwordField = z
  .string({ error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or less.');

//== REGISTER ==
const registerSchema = z.object({
  name: z
    .string({ error: 'Name is required.' })
    .trim()
    .min(1, 'Name is required.')
    .max(60, 'Name must be 60 characters or less.'),
  email: emailField,
  username: usernameField,
  password: passwordField,
});

//== LOGIN ==
// Not lowercased here, the route matches it against both fields itself
const loginSchema = z.object({
  identifier: z
    .string({ error: 'Username or email is required.' })
    .trim()
    .min(1, 'Username or email is required.'),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

export { registerSchema, loginSchema };
