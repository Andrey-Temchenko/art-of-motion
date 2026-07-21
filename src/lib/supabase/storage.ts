export function getSupabasePublicUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not defined. Please check your .env file.');
    return '';
  }

  // Remove trailing and leading slashes to prevent double slashes in URL
  const cleanBucket = bucket.replace(/^\/+|\/+$/g, '');
  const cleanPath = path.replace(/^\/+/, '');

  return `${supabaseUrl}/storage/v1/object/public/${cleanBucket}/${cleanPath}`;
}
