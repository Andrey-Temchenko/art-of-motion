import {z} from 'zod';

export const loginSchema = z.object({
  email: z.email('invalidEmail'),
  password: z.string().min(1, 'required')
});

export const registerSchema = z.object({
  fullName: z.string().min(1, 'required'),
  email: z.email('invalidEmail'),
  password: z.string().min(6, 'shortPassword')
});

export const resetPasswordSchema = z.object({
  email: z.email('invalidEmail')
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, 'shortPassword'),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'passwordsDoNotMatch',
    path: ['confirmPassword']
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
