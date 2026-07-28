import bcrypt from 'bcrypt';
import { config } from '../config/index.js';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = Math.max(config.security.bcryptSaltRounds, 12);
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  plainText: string,
  hashedText: string
): Promise<boolean> => {
  return await bcrypt.compare(plainText, hashedText);
};

export const checkPasswordStrength = (password: string): {
  score: number;
  label: 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Must be at least 8 characters long');

  if (password.length >= 12) score += 1;

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include at least one uppercase letter (A-Z)');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include at least one lowercase letter (a-z)');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include at least one digit (0-9)');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include at least one special character (!@#$%^&*)');

  let label: 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Weak';
  if (score >= 5) label = 'Very Strong';
  else if (score >= 4) label = 'Strong';
  else if (score >= 2) label = 'Medium';

  return { score, label, feedback };
};
