import {NextResponse, type NextRequest} from 'next/server';

import {defaultLocale, locales, LOCALE_COOKIE, type Locale} from '@/lib/i18n/config';
import {updateSession} from '@/lib/supabase/proxy';

function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const preferred = acceptLanguage.split(',')[0]?.split('-')[0] as Locale | undefined;
  if (preferred && locales.includes(preferred)) {
    return preferred;
  }

  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // 1. Refresh session - must be done before any redirects below, otherwise fresh cookies will be lost.
  const {response: supabaseResponse, claims} = await updateSession(request);

  // If we decide to create a new response (redirect) - transfer cookies to it,
  // which might have been updated by updateSession. This is an explicit requirement from the official example.
  const withAuthCookies = (response: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
    return response;
  };

  // 2. Locale (logic remains unchanged)
  const hasLocalePrefix = locales.some(locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  if (!hasLocalePrefix) {
    const locale = detectLocale(request);
    const url = new URL(`/${locale}${pathname}`, request.url);
    return withAuthCookies(NextResponse.redirect(url));
  }

  // 3. Protection for /admin and /(dashboard) - now based on verified claims,
  // rather than just the presence of a cookie. Full role verification (client vs admin) remains
  // in the Server Component layout + RLS, as before.
  const isProtectedRoute = locales.some(
    loc => pathname.startsWith(`/${loc}/dashboard`) || pathname.startsWith(`/${loc}/admin`)
  );

  if (isProtectedRoute && !claims) {
    const locale = detectLocale(request);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return withAuthCookies(NextResponse.redirect(loginUrl));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)']
};
