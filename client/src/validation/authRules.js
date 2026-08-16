// Mirrors server/validation/authSchemas.js. The server is still the authority,
// this only exists to tell people sooner. Keep the wording identical.

const NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;
// No space in this one, a username is a handle rather than a display name
const USERNAME_PATTERN = /^[\p{L}\p{N}_-]+$/u;

const NAME_CHARS =
  'Please only use letters, numbers, spaces, underscores _ or hyphens -';
const USERNAME_CHARS =
  'Please only use letters, numbers, underscores _ or hyphens -';

const checkName = value => {
  const trimmed = value.trim();
  if (!trimmed) return 'Name is required.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 60) return 'Name must be 60 characters or less.';
  if (!NAME_PATTERN.test(trimmed)) return NAME_CHARS;
  return '';
};

const checkUsername = value => {
  const trimmed = value.trim();
  if (!trimmed) return 'Username is required.';
  if (trimmed.length < 3) return 'Username must be at least 3 characters.';
  if (trimmed.length > 30) return 'Username must be 30 characters or less.';
  if (!USERNAME_PATTERN.test(trimmed)) return USERNAME_CHARS;
  return '';
};

// Deliberately loose, same as zod's. Anything stricter rejects real addresses
const checkEmail = value => {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return 'Please enter a valid email address.';
  return '';
};

// 72 is bcrypt's ceiling, past which it silently truncates
const checkNewPassword = value => {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (value.length > 72) return 'Password must be 72 characters or less.';
  return '';
};

// Login checks presence only. Length rules here would leak the password policy
const checkRequired = label => value =>
  value.trim() ? '' : `${label} is required.`;

//=== LIVE CHECKS ===
// Only the problems more typing cannot fix, so they can show mid-keystroke.
// Empty and too-short wait for blur, otherwise you get nagged while typing
const liveName = value => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length > 60) return 'Name must be 60 characters or less.';
  if (!NAME_PATTERN.test(trimmed)) return NAME_CHARS;
  return '';
};

const liveUsername = value => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length > 30) return 'Username must be 30 characters or less.';
  if (!USERNAME_PATTERN.test(trimmed)) return USERNAME_CHARS;
  return '';
};

const livePassword = value =>
  value.length > 72 ? 'Password must be 72 characters or less.' : '';

const registerRules = {
  name: checkName,
  email: checkEmail,
  username: checkUsername,
  password: checkNewPassword,
};

// No email entry here, a half typed address is invalid the whole way through
const registerLiveRules = {
  name: liveName,
  username: liveUsername,
  password: livePassword,
};

const loginRules = {
  identifier: checkRequired('Username or email'),
  password: checkRequired('Password'),
};

// Returns the first error found, or '' when everything passes
const firstError = (rules, values) => {
  for (const field of Object.keys(rules)) {
    const error = rules[field](values[field] ?? '');
    if (error) return error;
  }
  return '';
};

export { registerRules, registerLiveRules, loginRules, firstError };
