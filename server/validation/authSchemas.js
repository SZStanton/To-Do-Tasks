import { z } from 'zod';

// Emails are lowercased so lookups match regardless of how they were typed
const emailField = z
  .string({ error: 'Email is required.' })
  .trim()
  .min(1, 'Email is required.')
  .toLowerCase()
  .pipe(z.email('Please enter a valid email address.'));

// The display name. Spaces and capitals kept, this is what people see.
// \p{L} and \p{N} rather than A-Za-z0-9 so accented names like Renée work
const nameField = z
  .string({ error: 'Name is required.' })
  .trim()
  // Empty gets its own message, otherwise it reads as a length complaint
  .min(1, 'Name is required.')
  .min(2, 'Name must be at least 2 characters.')
  .max(60, 'Name must be 60 characters or less.')
  .regex(
    /^[\p{L}\p{N} _-]+$/u,
    'Please only use letters, numbers, spaces, underscores _ or hyphens -',
  )
  // Collapse double spaces so 'Jordan  Blake' cannot sit next to 'Jordan Blake'
  .transform(value => value.replace(/\s+/g, ' '));

// The sign-in handle. No spaces, and lowercased so the stored value is canonical
const usernameField = z
  .string({ error: 'Username is required.' })
  .trim()
  .min(1, 'Username is required.')
  .min(3, 'Username must be at least 3 characters.')
  .max(30, 'Username must be 30 characters or less.')
  .regex(
    /^[\p{L}\p{N}_-]+$/u,
    'Please only use letters, numbers, underscores _ or hyphens -',
  )
  .toLowerCase();

// 72 is bcrypt's limit. Anything longer is silently truncated, so reject it instead
const passwordField = z
  .string({ error: 'Password is required.' })
  .min(1, 'Password is required.')
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or less.');

//== REGISTER ==
const registerSchema = z.object({
  name: nameField,
  email: emailField,
  username: usernameField,
  password: passwordField,
});

//== LOGIN ==
// Lowercased because both email and username are stored that way
const loginSchema = z.object({
  identifier: z
    .string({ error: 'Username or email is required.' })
    .trim()
    .min(1, 'Username or email is required.')
    .toLowerCase(),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

export { registerSchema, loginSchema };
