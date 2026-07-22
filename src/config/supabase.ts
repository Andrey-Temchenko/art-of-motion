export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

export const supabaseConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
};
