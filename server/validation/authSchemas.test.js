import { describe, expect, it } from 'vitest';
import { registerSchema, loginSchema } from './authSchemas.js';

// The first message is what the route sends back, so that is what is asserted
const firstError = result =>
  result.success ? '' : result.error.issues[0].message;

const VALID = {
  name: 'Jordan Blake',
  email: 'jordan@example.com',
  username: 'jordan_blake',
  password: 'longenoughpw',
};

const register = overrides =>
  registerSchema.safeParse({ ...VALID, ...overrides });

describe('registerSchema', () => {
  it('accepts a normal signup', () => {
    expect(register({}).success).toBe(true);
  });

  describe('name', () => {
    it('keeps spaces and capitals, it is a display name', () => {
      expect(register({ name: 'Jordan Blake' }).data.name).toBe('Jordan Blake');
    });

    it('allows accented letters', () => {
      expect(register({ name: 'Renée Müller' }).success).toBe(true);
    });

    it('collapses double spaces so two names cannot look identical', () => {
      expect(register({ name: 'Jordan  Blake' }).data.name).toBe(
        'Jordan Blake',
      );
    });

    it('rejects an email, people paste one in by habit', () => {
      expect(firstError(register({ name: 'jordan@example.com' }))).toMatch(
        /only use letters/i,
      );
    });

    it('says required rather than too short when empty', () => {
      expect(firstError(register({ name: '' }))).toBe('Name is required.');
    });
  });

  describe('username', () => {
    it('lowercases, it is a handle not a display name', () => {
      expect(register({ username: 'JORDAN_Blake' }).data.username).toBe(
        'jordan_blake',
      );
    });

    it('rejects spaces, which is what separates it from name', () => {
      expect(firstError(register({ username: 'jordan blake' }))).toMatch(
        /only use letters/i,
      );
    });

    it('rejects an email, the old gmail rule is long gone', () => {
      expect(register({ username: 'jordan@example.com' }).success).toBe(false);
    });

    it('needs three characters', () => {
      expect(firstError(register({ username: 'jo' }))).toMatch(/at least 3/);
    });
  });

  describe('password', () => {
    it('needs eight characters', () => {
      expect(firstError(register({ password: '1234567' }))).toMatch(
        /at least 8/,
      );
    });

    it('caps at 72, past which bcrypt truncates silently', () => {
      expect(firstError(register({ password: 'x'.repeat(73) }))).toMatch(
        /72 characters or less/,
      );
    });

    it('does not trim, a trailing space is part of the password', () => {
      expect(register({ password: 'longenough ' }).data.password).toBe(
        'longenough ',
      );
    });
  });

  it('lowercases and trims the email', () => {
    expect(register({ email: '  Jordan@Example.COM ' }).data.email).toBe(
      'jordan@example.com',
    );
  });
});

describe('loginSchema', () => {
  it('lowercases the identifier, both stored fields are lowercase', () => {
    const result = loginSchema.safeParse({
      identifier: '  JORDAN_Blake ',
      password: 'x',
    });
    expect(result.data.identifier).toBe('jordan_blake');
  });

  it('has no length rules, they would leak the password policy', () => {
    const result = loginSchema.safeParse({ identifier: 'a', password: '1' });
    expect(result.success).toBe(true);
  });

  it('still requires both fields', () => {
    const result = loginSchema.safeParse({ identifier: '', password: '' });
    expect(firstError(result)).toBe('Username or email is required.');
  });
});
