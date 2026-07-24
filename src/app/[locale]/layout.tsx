import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {notFound} from 'next/navigation';
import {Geist, Geist_Mono} from 'next/font/google';
import {GoogleAnalytics} from '@next/third-parties/google';
import {Analytics} from '@vercel/analytics/next';
import {SpeedInsights} from '@vercel/speed-insights/next';

import {siteConfig} from '@/config/site';
import {isAnalyticsEnabled} from '@/lib/analytics';
import {locales, type Locale} from '@/lib/i18n/config';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {ThemeProvider} from '@/providers/themeProvider';

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
      template: `%s | ArtOfMotion`
    },
    description: dict.meta.description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: dict.meta.siteName,
      description: dict.meta.description,
      url: `${baseUrl}/${locale}`,
      siteName: 'ArtOfMotion',
      locale: locale,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.siteName,
      description: dict.meta.description
    },
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
