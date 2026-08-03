import {createClient as createSupabaseClient} from '@supabase/supabase-js';

import {supabaseConfig} from '@/config/supabase';

import type {Database} from '@/types/database.types';

import {env} from '@/env';

export function createAdminClient() {
  const serviceKey = env.SUPABASE_SECRET_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SECRET_KEY is not defined in environment variables');
  }
  return createSupabaseClient<Database>(supabaseConfig.url, serviceKey, {
    auth: {autoRefreshToken: false, persistSession: false}
  });
}
