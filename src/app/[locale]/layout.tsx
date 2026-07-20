import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {notFound} from 'next/navigation';
import {Geist, Geist_Mono} from 'next/font/google';

import {locales, type Locale} from '@/lib/i18n/config';
import {getDictionary} from '@/lib/i18n/get-dictionary';
import {ThemeProvider} from '@/providers/theme-provider';

import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export function generateStaticParams() {
  return locales.map(locale => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);

  return {
    title: dict.meta.siteName,
    description: dict.meta.description,
    appleWebApp: {
      title: 'ArtOfMotion',
      statusBarStyle: 'default'
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        uk: '/uk',
        ru: '/ru',
        en: '/en',
        'x-default': '/uk'
      }
    }
  };
}

export default async function RootLocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
