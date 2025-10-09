export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_menu',
    'manage_orders',
    'view_analytics',
    'manage_settings',
    'manage_reviews',
    'manage_reservations',
    'manage_ai_settings',
  ],
  [USER_ROLES.STAFF]: [
    'manage_orders',
    'view_analytics',
    'manage_reservations',
    'view_menu',
  ],
  [USER_ROLES.CUSTOMER]: [
    'place_orders',
    'make_reservations',
    'write_reviews',
    'view_menu',
  ],
} as const;

export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.STAFF]: 2,
  [USER_ROLES.CUSTOMER]: 1,
} as const;

export function hasPermission(role: UserRole, permission: keyof typeof ROLE_PERMISSIONS[UserRole]): boolean {
  return (ROLE_PERMISSIONS as any)[role]?.includes(permission) || false;
}

export function hasHigherRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
