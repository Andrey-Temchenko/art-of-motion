import {USER_ROLE} from '@/constants/roles';

export const ROUTES = {
  ADMIN: {
    DASHBOARD: '/admin',
    CLIENTS: '/admin/clients',
    SLOTS: '/admin/slots',
    TEMPLATES: '/admin/slot-templates'
  },
  DASHBOARD: {
    SCHEDULE: '/dashboard/schedule',
    MY_BOOKINGS: '/dashboard/my-bookings'
  },
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register'
  },
  MARKETING: {
    HOME: '/'
  }
} as const;

/**
 * Returns the default dashboard route for a given user role.
 */
export const getDefaultDashboardRoute = (role: string | null | undefined): string => {
  if (role === USER_ROLE.ADMIN) {
    return ROUTES.ADMIN.DASHBOARD;
  }
  return ROUTES.DASHBOARD.SCHEDULE;
};

/**
 * Helper to build a localized route string.
 */
export const buildRoute = (locale: string, route: string): string => {
  // If the route is just '/', returning `/${locale}` instead of `/${locale}/`
  if (route === '/') {
    return `/${locale}`;
  }
  return `/${locale}${route}`;
};

/**
 * Helper to determine if a route is currently active.
 * Prevents base routes (like /admin or /dashboard) from remaining active
 * when navigating to sub-routes (like /admin/clients).
 */
export const isRouteActive = (pathname: string, href: string, locale: string): boolean => {
  const isBaseRoute = href === buildRoute(locale, ROUTES.ADMIN.DASHBOARD) || href === `/${locale}/dashboard`;
  return pathname === href || (!isBaseRoute && pathname.startsWith(`${href}/`));
};

/**
 * Helper to build a cache revalidation path for Next.js App Router.
 * Next.js revalidatePath requires the folder segment pattern (e.g. '/[locale]/admin/slots').
 */
export const buildRevalidatePath = (route: string): string => {
  if (route === '/') return '/';
  return `/[locale]${route}`;
};
