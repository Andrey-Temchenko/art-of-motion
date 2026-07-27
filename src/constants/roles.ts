export const USER_ROLE = {
  CLIENT: 'client',
  ADMIN: 'admin'
} as const;

export type UserRoleType = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_ROLE_VALUES = Object.values(USER_ROLE) as [UserRoleType, ...UserRoleType[]];
