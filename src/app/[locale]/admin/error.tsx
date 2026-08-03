'use client';

import React, {useEffect} from 'react';

import {useClientDictionary} from '@/lib/i18n/useClientDictionary';

import {Button} from '@/components/ui/button';

export default function AdminError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  const {dict} = useClientDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  if (!dict) return null;

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
      <h2 className="text-h2 text-foreground">{dict.ui.errorTitle}</h2>
      <p className="text-muted-foreground">{error.message || dict.ui.errorDesc}</p>
      <Button onClick={() => reset()} variant="default">
        {dict.ui.errorRetry}
      </Button>
    </div>
  );
}
