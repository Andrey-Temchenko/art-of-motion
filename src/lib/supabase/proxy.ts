import {NextResponse, type NextRequest} from 'next/server';

import {createServerClient} from '@supabase/ssr';

import {supabaseConfig} from '@/config/supabase';

import type {Database} from '@/types/database.types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({request});

  const supabase = createServerClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({request});
        cookiesToSet.forEach(({name, value, options}) => supabaseResponse.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => supabaseResponse.headers.set(key, value as string));
      }
    }
  });

  // There must be no code between createServerClient and getClaims() -
  // this is a strict requirement from the official example, not just formatting.
  const {data} = await supabase.auth.getClaims();

  return {response: supabaseResponse, claims: data?.claims ?? null};
}
