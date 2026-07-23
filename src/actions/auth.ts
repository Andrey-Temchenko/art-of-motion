'use server';

import {redirect} from 'next/navigation';
import {headers} from 'next/headers';

import {createClient} from '@/lib/supabase/server';
import {siteConfig} from '@/config/site';

type AuthActionResponse = {
  success?: boolean;
  error?: string;
};

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

export async function signInWithEmail(data: {email: string; password: string}): Promise<AuthActionResponse> {
  const supabase = await createClient();

  const {error} = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });

  if (error) {
    return {error: error.message};
  }

  return {success: true};
}

export async function signUpWithEmail(data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthActionResponse> {
  const supabase = await createClient();

  const {error} = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName
      }
    }
  });

  if (error) {
    return {error: error.message};
  }

  return {success: true};
}

export async function resetPassword(data: {email: string}): Promise<AuthActionResponse> {
  const supabase = await createClient();

  const headersList = await headers();
  const origin = headersList.get('origin') || siteConfig.baseUrl;

  const {error} = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${origin}/api/auth/callback?next=/reset-password/update`
  });

  if (error) {
    return {error: error.message};
  }

  return {success: true};
}

export async function signOut(): Promise<AuthActionResponse> {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return {success: true};
}

export async function updatePassword(data: {password: string}): Promise<AuthActionResponse> {
  const supabase = await createClient();

  const {error} = await supabase.auth.updateUser({
    password: data.password
  });

  if (error) {
    return {error: error.message};
  }

  return {success: true};
}
