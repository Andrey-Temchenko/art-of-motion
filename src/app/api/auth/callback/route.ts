import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {cookies} from 'next/headers';
import {LOCALE_COOKIE} from '@/lib/i18n/config';

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

    const {error} = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // NOTE: We could fetch user role here and redirect accordingly,
      // but for Ticket 1 we just establish the session and redirect to next/home.
      const redirectUrl = next.startsWith(`/${locale}`) ? next : `${localePrefix}${next}`;
      return NextResponse.redirect(`${origin}${redirectUrl === '' ? '/' : redirectUrl}`);
    }
    console.error('OAuth Callback Error:', error.message);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}${localePrefix}/login?error=Could+not+authenticate`);
}
