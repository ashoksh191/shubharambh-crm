import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Username or Email must be at least 3 characters long')
    .max(100, 'Identifier cannot exceed 100 characters')
    .trim(),
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
  rememberMe: z.boolean().optional().default(false),
  twoFactorToken: z.string().optional().refine((val) => !val || /^\d{6}$/.test(val), {
    message: '2FA Token must be exactly 6 digits',
  }),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format').max(100, 'Email cannot exceed 100 characters').trim().toLowerCase(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .trim(),
  fullName: z.string().min(2, 'Full name is required').max(100, 'Full name cannot exceed 100 characters').trim(),
  phone: z
    .string()
    .regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, 'Invalid Indian mobile phone number')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum([
    'SUPER_ADMIN',
    'ADMIN',
    'SALES_MANAGER',
    'SALES_EXECUTIVE',
    'FINANCE',
    'ASSOCIATE',
    'CUSTOMER_SUPPORT',
    'VIEWER',
  ]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address format').trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, '2FA Code must be exactly 6 digits').regex(/^\d{6}$/, '2FA code must be numeric'),
});

export const updateRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(100),
  role: z.enum([
    'SUPER_ADMIN',
    'ADMIN',
    'SALES_MANAGER',
    'SALES_EXECUTIVE',
    'FINANCE',
    'ASSOCIATE',
    'CUSTOMER_SUPPORT',
    'VIEWER',
  ]),
});

export const approvalReviewSchema = z.object({
  userId: z.string().min(1, 'User ID is required').max(100),
  action: z.enum(['APPROVE', 'REJECT']),
});
