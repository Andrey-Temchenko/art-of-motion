'use client';

import {useClientDictionary} from '@/lib/i18n/useClientDictionary';

export default function Loading() {
  const {dict} = useClientDictionary();

  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Simple spinner with brand color */}
        <div className="border-muted border-t-brand-mfr h-12 w-12 animate-spin rounded-full border-4"></div>
        <p className="text-muted-foreground animate-pulse text-sm">{dict.ui.loading}</p>
      </div>
    </div>
  );
}
