import React from 'react';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';

import {Button} from '@/components/ui/button';

export default async function AuthLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background abstract element */}
      <div className="from-primary/10 via-brand-stretch/5 absolute inset-0 -z-10 h-full w-full bg-gradient-to-br to-transparent opacity-70" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20 md:top-10 md:left-10">
        <Button
          className="group bg-brand-balance ring-brand-stretch/30 hover:ring-brand-stretch/60 flex size-14 cursor-pointer items-center justify-center rounded-full text-white shadow-xl ring-4 transition-all duration-300 hover:scale-110 active:scale-95"
          render={<Link href={`/${locale}`} aria-label="Back to home" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-6" strokeWidth={2.5} />
        </Button>
      </div>

      <div className="z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
