import { describe, expect, it } from 'vitest';
import { registerRules, registerLiveRules, loginRules } from './authRules';
import {
  registerSchema,
  loginSchema,
} from '../../../server/validation/authSchemas.js';

// These rules exist only to tell people sooner. If they ever disagree with the
// server, someone sees one message while typing and a different one on submit.
describe('the client rules agree with the server', () => {
  const VALID = {
    name: 'Jordan Blake',
    email: 'jordan@example.com',
    username: 'jordan_blake',
    password: 'longenoughpw',
  };

  const VALUES = [
    '',
    '   ',
    'J',
    'Jo',
    'Jordan Blake',
    'jordan blake',
    'jordan_blake',
    'JORDAN-Blake',
    'Jordan!Blake',
    "Sean O'Brien",
    'Renée',
    'jordan@example.com',
    'a@b.co',
    'nope',
    '1234567',
    'longenoughpw',
    'x'.repeat(73),
    'a'.repeat(61),
  ];

  for (const field of ['name', 'email', 'username', 'password']) {
    for (const value of VALUES) {
      it(`${field} = ${JSON.stringify(value)}`, () => {
        const parsed = registerSchema.safeParse({ ...VALID, [field]: value });
        const server = parsed.success ? '' : parsed.error.issues[0].message;

        expect(registerRules[field](value)).toBe(server);
      });
    }
  }

  it('login rules agree too', () => {
    const parsed = loginSchema.safeParse({ identifier: '', password: 'x' });
    expect(loginRules.identifier('')).toBe(parsed.error.issues[0].message);
  });
});

// The rule is: flag only what more typing cannot fix
describe('live rules, shown before the field is left', () => {
  it('says nothing about a half typed name', () => {
    expect(registerLiveRules.name('J')).toBe('');
    expect(registerLiveRules.name('Jordan')).toBe('');
  });

  it('says nothing about an empty field, you may not have started', () => {
    expect(registerLiveRules.name('')).toBe('');
    expect(registerLiveRules.username('')).toBe('');
  });

  it('flags a bad character straight away, typing cannot fix it', () => {
    expect(registerLiveRules.name('Jordan!')).toMatch(/only use letters/i);
    expect(registerLiveRules.username('jordan blake')).toMatch(
      /only use letters/i,
    );
  });

  it('flags going over the limit straight away', () => {
    expect(registerLiveRules.username('a'.repeat(31))).toMatch(
      /30 characters or less/,
    );
  });

  it('has no entry for email, half an address is invalid all the way', () => {
    expect(registerLiveRules.email).toBeUndefined();
  });
});
