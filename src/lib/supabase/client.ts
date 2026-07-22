import {createBrowserClient} from '@supabase/ssr';
import {supabaseConfig} from '@/config/supabase';

export function createClient() {
  return createBrowserClient(supabaseConfig.url, supabaseConfig.publishableKey);
}
