'use client';

import {useEffect} from 'react';
import {useClientDictionary} from '@/lib/i18n/useClientDictionary';
import {Button} from '@/components/ui/button';

export default function Error({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  const {dict} = useClientDictionary();

  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{dict.ui.errorTitle}</h2>
        <p className="text-muted-foreground max-w-md">{dict.ui.errorDesc}</p>
      </div>
      <Button onClick={() => reset()} className="bg-brand-mfr hover:bg-brand-mfr/90 text-white">
        {dict.ui.errorRetry}
      </Button>
    </div>
  );
}
