'use server';

import {createClient} from '@/lib/supabase/server';
import {redirect} from 'next/navigation';
import {headers} from 'next/headers';
import {siteConfig} from '@/config/site';

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin') || siteConfig.baseUrl;

  let localePrefix = '';
  const referer = headersList.get('referer');
  if (referer) {
    try {
      const match = new URL(referer).pathname.match(/^\/([a-z]{2})(?:\/|$)/);
      if (match) localePrefix = match[0].replace(/\/$/, '');
    } catch {}
  }

  const {data, error} = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/api/auth/callback`
    }
  });

  if (error) {
    console.error('Google OAuth error:', error.message);
    return redirect(`${localePrefix}/login?error=Could not authenticate+with+Google`);
  }

  if (data.url) {
    redirect(data.url);
  }
}
