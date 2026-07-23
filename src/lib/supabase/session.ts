import {redirect} from 'next/navigation';
import {User} from '@supabase/supabase-js';

import {createClient} from './server';
import {UserRole, Profile} from './types';

/**
 * Internal helper to get the authenticated user and initialized client.
 */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: {user},
    error
  } = await supabase.auth.getUser();
  return {supabase, user, error};
}

/**
 * Returns the current authenticated user or redirects to login.
 */
export async function requireUser(): Promise<User> {
  const {user, error} = await getAuthenticatedUser();

  if (error || !user) {
    redirect('/login');
  }

  return user;
}

/**
 * Returns the current user's profile without redirecting (useful for conditional rendering).
 */
export async function getUserProfile(): Promise<{user: User | null; profile: Profile | null}> {
  const {supabase, user} = await getAuthenticatedUser();

  if (!user) {
    return {user: null, profile: null};
  }

  const {data: profile} = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return {user, profile};
}

/**
 * Requires a user and checks if their role is within the allowed roles.
 * Redirects to login if not authenticated, or to dashboard if unauthorized.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<{user: User; profile: Profile}> {
  const {supabase, user, error} = await getAuthenticatedUser();

  if (error || !user) {
    redirect('/login');
  }

  const {data: profile} = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    // If user is authenticated but not authorized for this route
    redirect('/dashboard');
  }

  return {user, profile};
}
