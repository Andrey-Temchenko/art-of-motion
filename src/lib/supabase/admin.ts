import {createClient as createSupabaseClient} from '@supabase/supabase-js';
import {supabaseConfig} from '@/config/supabase';
import {Database} from '@/types/database.types';

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SECRET_KEY is not defined in environment variables');
  }
  return createSupabaseClient<Database>(supabaseConfig.url, serviceKey, {
    auth: {autoRefreshToken: false, persistSession: false}
  });
}
