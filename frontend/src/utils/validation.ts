// utils/validation.ts
export const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

export const isValidEmail = (email: string): boolean => emailRegex.test(email);

export const isValidPassword = (password: string): boolean =>
  passwordRegex.test(password);
