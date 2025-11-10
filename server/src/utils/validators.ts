import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 * Requirements: min 8 chars, at least one uppercase, one lowercase, one number, one special char
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

/**
 * Full name validation schema
 */
export const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

/**
 * Phone number validation schema (international format)
 */
export const phoneNumberSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    'Invalid phone number format. Use international format (e.g., +1234567890)'
  )
  .optional();

/**
 * UUID validation schema
 */
export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format');

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Register validation schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: fullNameSchema,
  phone_number: phoneNumberSchema,
});

/**
 * Update profile validation schema
 */
export const updateProfileSchema = z.object({
  full_name: fullNameSchema.optional(),
  phone_number: phoneNumberSchema,
  profile_image_url: z.string().url('Invalid URL format').optional(),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Old password is required'),
  new_password: passwordSchema,
});

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  new_password: passwordSchema,
});

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
});

/**
 * Pagination query validation schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Helper function to validate data against schema
 */
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

/**
 * Helper function to safely validate data (returns errors instead of throwing)
 */
export const validateSafe = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  return { success: false, errors };
};
