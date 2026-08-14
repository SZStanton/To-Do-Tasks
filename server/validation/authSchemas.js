import { z } from 'zod';

// Trim and lowercase run before validation, so the routes get clean values back.
// Takes its own message so a missing field never leaks zod's internal wording
const identifierField = message =>
  z.string({ error: message }).trim().toLowerCase();

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
  email: identifierField('Email is required.').pipe(
    z.email('Please enter a valid email address.'),
  ),
  // The register page has always advertised this rule, nothing enforced it
  username: identifierField('Username is required.')
    .min(1, 'Username is required.')
    .refine(
      value => value.endsWith('@gmail.com'),
      'Username must end with @gmail.com.',
    ),
  password: passwordField,
});

//== LOGIN ==
// No length rules here, they would only leak the password policy to strangers
const loginSchema = z.object({
  identifier: identifierField('Username or email is required.').min(
    1,
    'Username or email is required.',
  ),
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

export { registerSchema, loginSchema };
