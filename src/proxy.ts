import {NextResponse, type NextRequest} from 'next/server';
import {defaultLocale, locales, LOCALE_COOKIE, type Locale} from '@/lib/i18n/config';

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

export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;

  const hasLocalePrefix = locales.some(locale => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  if (!hasLocalePrefix) {
    const locale = detectLocale(request);
    const url = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(url);
  }

  // Lightweight check for /admin and /(dashboard) routes:
  // here we only check for the presence of a session cookie + redirect to /{locale}/login.
  // Full role verification is done in the Server Component layout.
  const isProtectedRoute = locales.some(
    loc => pathname.startsWith(`/${loc}/dashboard`) || pathname.startsWith(`/${loc}/admin`)
  );

  if (isProtectedRoute) {
    const allCookies = request.cookies.getAll();
    const hasAuthCookie = allCookies.some(
      cookie => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
    );

    if (!hasAuthCookie) {
      const locale = detectLocale(request);
      const url = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)']
};
