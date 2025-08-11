// utils/validation.ts
export const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
export const emojiRegex = /\p{Emoji}/gu;

export const isValidEmail = (email: string): boolean => emailRegex.test(email);

export const isValidPassword = (password: string): boolean =>
  passwordRegex.test(password);

export const isValidHabit = (
  habit: string
): { valid: boolean; error?: string } => {
  const trimmed = habit.trim();

  if (!trimmed) {
    return { valid: false, error: "Habit name is required" };
  }

  if (trimmed.length > 64) {
    return { valid: false, error: "Habit name cannot exceed 64 characters" };
  }

  return { valid: true };
};
