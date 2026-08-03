import {useRouter} from 'next/navigation';

import {ROUTES, buildRoute} from '@/config/navigation';

import {createClient} from '@/lib/supabase/client';

import {signOut} from '@/actions/auth';

export const useSignOut = () => {
  const router = useRouter();

  const handleSignOut = async (locale: string) => {
    try {
      await signOut();
    } catch (error) {
      console.error('Server sign out action failed:', error);
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(buildRoute(locale, ROUTES.MARKETING.HOME));
    router.refresh();
  };

  return {handleSignOut};
};
