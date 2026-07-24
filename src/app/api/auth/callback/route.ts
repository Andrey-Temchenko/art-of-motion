import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {cookies} from 'next/headers';
import {LOCALE_COOKIE} from '@/lib/i18n/config';
import {getDefaultDashboardRoute} from '@/config/navigation';
import {getUserRoleServer} from '@/lib/supabase/session';
import {USER_ROLES} from '@/lib/supabase/constants';

export async function GET(request: Request) {
  const {searchParams, origin} = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" or "redirect_to" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? searchParams.get('redirect_to') ?? '/';

  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value;
  const localePrefix = locale ? `/${locale}` : '';

  if (code) {
    const supabase = await createClient();

    const {data: sessionData, error} = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      let finalNext = next;

      if (next === '/' || next === '') {
        let role = USER_ROLES.CLIENT;
        if (sessionData.user) {
          role = await getUserRoleServer(sessionData.user.id);
        }
        finalNext = getDefaultDashboardRoute(role);
      }

      const redirectUrl = finalNext.startsWith(`/${locale}`) ? finalNext : `${localePrefix}${finalNext}`;
      return NextResponse.redirect(`${origin}${redirectUrl === '' ? '/' : redirectUrl}`);
    }
    console.error('OAuth Callback Error:', error.message);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}${localePrefix}/login?error=Could+not+authenticate`);
}
