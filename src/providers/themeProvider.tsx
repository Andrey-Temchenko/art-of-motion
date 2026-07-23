'use client';

import React, {ComponentProps} from 'react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';

import {siteConfig} from '@/config/site';

// Suppress harmless Next.js hydration warnings caused by next-themes script injection during development
if (typeof window !== 'undefined' && siteConfig.isDev) {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    orig.apply(console, args);
  };
}

export function ThemeProvider({children, ...props}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
