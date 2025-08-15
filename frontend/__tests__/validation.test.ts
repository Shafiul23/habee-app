import { isValidEmail, isValidPassword } from '../src/utils/validation';

describe('validation utilities', () => {
  it('validates email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('bad-email')).toBe(false);
  });

  it('validates password complexity', () => {
    expect(isValidPassword('Passw0rd')).toBe(true);
    expect(isValidPassword('short')).toBe(false);
  });
});
