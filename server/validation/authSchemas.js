import { z } from 'zod';

// Emails are lowercased so lookups match regardless of how they were typed
const emailField = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .pipe(z.email('Please enter a valid email address.'));

// Shared by name and username. Case is kept, both are human-facing.
// \p{L} and \p{N} rather than A-Za-z0-9 so accented names like Renée work
const nameLikeField = (label, min, max) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or less.`)
    .regex(
      /^[\p{L}\p{N} '_-]+$/u,
      `${label} can only contain letters, numbers, spaces, apostrophes, hyphens and underscores.`,
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
  name: nameLikeField('Name', 2, 60),
  email: emailField,
  username: nameLikeField('Username', 3, 30),
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
