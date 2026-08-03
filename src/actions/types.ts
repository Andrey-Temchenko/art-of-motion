import {type UserRoleType} from '@/constants/roles';

export interface ActionState {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface AuthActionResponse {
  success?: boolean;
  error?: string;
  role?: UserRoleType;
}
