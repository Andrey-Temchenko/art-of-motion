import {createClient} from '@/lib/supabase/server';
import {Profile, UserRole} from '@/lib/supabase/types';
import {USER_ROLES} from '@/lib/supabase/constants';

export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const {data: profile, error} = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error || !profile) {
    return null;
  }

  return profile as Profile;
}

export async function getProfileRoleById(userId: string): Promise<UserRole> {
  const supabase = await createClient();
  const {data: profile, error} = await supabase.from('profiles').select('role').eq('id', userId).single();

  if (error || !profile) {
    return USER_ROLES.CLIENT as UserRole;
  }

  return profile.role as UserRole;
}
