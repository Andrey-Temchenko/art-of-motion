import {env} from '@/env';

export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

export const supabaseConfig: SupabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
};
