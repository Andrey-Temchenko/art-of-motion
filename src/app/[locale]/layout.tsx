import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';

import {GoogleAnalytics} from '@next/third-parties/google';
import {Analytics} from '@vercel/analytics/next';
import {SpeedInsights} from '@vercel/speed-insights/next';

import {siteConfig} from '@/config/site';

import {isAnalyticsEnabled} from '@/lib/analytics';
import {locales, APP_LOCALES, type Locale} from '@/lib/i18n/config';
import {getDictionary} from '@/lib/i18n/getDictionary';

import {DictionaryProvider} from '@/providers/dictionaryProvider';
import {ThemeProvider} from '@/providers/themeProvider';

import {Toaster} from '@/components/ui/sonner';

import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'cyrillic']
});

export function generateStaticParams() {
  return locales.map(locale => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);
  const baseUrl = siteConfig.baseUrl;

  return {
    title: {
      default: dict.meta.siteName,
      template: `%s | ${siteConfig.name}`
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: dict.meta.siteName,
      description: dict.meta.description,
      url: `${baseUrl}/${locale}`,
      siteName: siteConfig.name,
      locale: locale,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.siteName,
      description: dict.meta.description
    },
    appleWebApp: {
      title: siteConfig.name,
      statusBarStyle: 'default'
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(locales.map(loc => [loc, `/${loc}`])),
        'x-default': `/${APP_LOCALES.UK}`
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
  const validLocale = locale as Locale;

  if (!locales.includes(validLocale)) {
    notFound();
  }

  const dict = await getDictionary(validLocale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        {isAnalyticsEnabled ? (
          <>
            <GoogleAnalytics gaId={siteConfig.gaMeasurementId} />
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DictionaryProvider dict={dict}>
            {children}
            <Toaster />
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
