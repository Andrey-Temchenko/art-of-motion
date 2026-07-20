import {NextResponse, type NextRequest} from 'next/server';
import {defaultLocale, locales, type Locale} from '@/lib/i18n/config';

const LOCALE_COOKIE = 'NEXT_LOCALE';

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

  // Lightweight check for future /admin and /(dashboard) routes:
  // here we only check for the presence of a session cookie + redirect to /{locale}/login.
  // Full role verification is done in the Server Component layout,
  // see ARCHITECTURE.md §4.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)']
};
