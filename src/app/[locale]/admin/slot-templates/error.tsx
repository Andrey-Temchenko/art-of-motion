'use client';

import React from 'react';
import {AlertCircleIcon, RefreshCcwIcon} from 'lucide-react';

import {useClientDictionary} from '@/lib/i18n/useClientDictionary';

import {Button} from '@/components/ui/button';

export default function SlotTemplatesError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  const {dict} = useClientDictionary();

  if (!dict) return null;

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="bg-destructive/10 text-destructive rounded-full p-3">
        <AlertCircleIcon className="h-8 w-8" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{dict.ui.errorTitle}</h2>
        <p className="text-muted-foreground mt-2 text-sm">{error.message || dict.ui.errorDesc}</p>
      </div>
      <Button onClick={() => reset()} variant="outline" className="mt-4">
        <RefreshCcwIcon className="mr-2 h-4 w-4" />
        {dict.ui.errorRetry}
      </Button>
    </div>
  );
}
