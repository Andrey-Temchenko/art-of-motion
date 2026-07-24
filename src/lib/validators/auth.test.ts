import {describe, it, expect} from 'vitest';
import {loginSchema, updatePasswordSchema} from './auth';

describe('Auth Validators', () => {
  describe('loginSchema', () => {
    it('should validate a correct email and password', () => {
      const result = loginSchema.safeParse({email: 'test@example.com', password: 'password123'});
      expect(result.success).toBe(true);
    });

    it('should fail with an invalid email', () => {
      const result = loginSchema.safeParse({email: 'not-an-email', password: 'password123'});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('invalidEmail');
      }
    });

    it('should fail when password is empty', () => {
      const result = loginSchema.safeParse({email: 'test@example.com', password: ''});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('required');
      }
    });
  });

  describe('updatePasswordSchema', () => {
    it('should validate when passwords match and are long enough', () => {
      const result = updatePasswordSchema.safeParse({password: 'newpassword', confirmPassword: 'newpassword'});
      expect(result.success).toBe(true);
    });

    it('should fail when passwords do not match', () => {
      const result = updatePasswordSchema.safeParse({password: 'newpassword', confirmPassword: 'differentpassword'});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('passwordsDoNotMatch');
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('should fail when password is too short', () => {
      const result = updatePasswordSchema.safeParse({password: 'short', confirmPassword: 'short'});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('shortPassword');
      }
    });
  });
});
