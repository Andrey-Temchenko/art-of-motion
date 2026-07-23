import {UserRole} from './types';

export const USER_ROLES = {
  CLIENT: 'client' as UserRole,
  ADMIN: 'admin' as UserRole
} as const;

export const SUPABASE_BUCKETS = {
  MARKETING_MEDIA: 'marketing-media'
} as const;
