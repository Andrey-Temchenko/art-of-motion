import {createBrowserClient} from '@supabase/ssr';

import {supabaseConfig} from '@/config/supabase';
import {Database} from '@/types/database.types';

export function createClient() {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey);
}
