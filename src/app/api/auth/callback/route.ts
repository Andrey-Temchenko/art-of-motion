import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

import {createClient} from '@/lib/supabase/server';
import {LOCALE_COOKIE, defaultLocale} from '@/lib/i18n/config';
import {getUserRoleServer} from '@/lib/supabase/session';
import {getDefaultDashboardRoute, ROUTES, buildRoute} from '@/config/navigation';
import {USER_ROLE} from '@/constants/roles';

export async function GET(request: Request): Promise<Response> {
  const {searchParams} = new URL(request.url);
  const code = searchParams.get('code');

  let next = searchParams.get('next') ?? searchParams.get('redirect_to') ?? '/';

  // Security: Protect against Open Redirect vulnerability (ensure it's a relative path)
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/';
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value || defaultLocale;

  if (code) {
    const supabase = await createClient();

    const {data: sessionData, error} = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      let finalNext = next;

      // If it's a root route, calculate default dashboard based on user role
      if (next === '/' || next === '') {
        let role: string = USER_ROLE.CLIENT;
        if (sessionData.user) {
          role = await getUserRoleServer(sessionData.user.id);
        }
        finalNext = getDefaultDashboardRoute(role);
      }

      // If finalNext doesn't have the locale prefix yet, add it using our helper
      const redirectPath = finalNext.startsWith(`/${locale}`) ? finalNext : buildRoute(locale, finalNext);

      // Best Practice: use Next.js new URL instead of manual string concatenation
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    console.error('OAuth Callback Error:', error.message);
  }

  // Redirect to login page in case of error using ROUTES from navigation.ts
  const loginPath = buildRoute(locale, ROUTES.AUTH.LOGIN);
  const errorUrl = new URL(loginPath, request.url);
  errorUrl.searchParams.set('error', 'Could not authenticate');

  return NextResponse.redirect(errorUrl);
}
