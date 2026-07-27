'use client';

import React, {useEffect} from 'react';

import {useClientDictionary} from '@/lib/i18n/useClientDictionary';

import {Button} from '@/components/ui/button';

export default function SlotDetailsError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  const {dict} = useClientDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-card flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border p-8 text-center shadow-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{dict?.ui?.errorTitle || 'Something went wrong!'}</h2>
        <p className="text-muted-foreground">
          {dict?.ui?.errorDesc || 'Failed to load slot details. Please try again.'}
        </p>
      </div>
      <Button onClick={() => reset()}>{dict?.ui?.errorRetry || 'Try again'}</Button>
    </div>
  );
}
