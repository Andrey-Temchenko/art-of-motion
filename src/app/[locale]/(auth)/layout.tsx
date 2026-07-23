import React from 'react';
import {BackButton} from '@/components/shared/BackButton';

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
      <BackButton href={`/${locale}`} ariaLabel="Back to home" />

      <div className="z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
