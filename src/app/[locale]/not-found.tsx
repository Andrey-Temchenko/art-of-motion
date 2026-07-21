'use client';

import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {useClientDictionary} from '@/lib/i18n/useClientDictionary';

export default function NotFound() {
  const {dict} = useClientDictionary();

  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-brand-strength text-7xl font-extrabold tracking-tighter opacity-20">404</h1>
        <h2 className="text-3xl font-bold tracking-tight">{dict.ui.notFoundTitle}</h2>
        <p className="text-muted-foreground max-w-md">{dict.ui.notFoundDesc}</p>
      </div>
      <Link href="/">
        <Button className="bg-brand-mfr hover:bg-brand-mfr/90 text-white">{dict.ui.backHome}</Button>
      </Link>
    </div>
  );
}
