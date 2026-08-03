import type {MetadataRoute} from 'next';

import {siteConfig} from '@/config/site';

import {locales} from '@/lib/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map(locale => ({
    url: `${siteConfig.baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1.0,
    alternates: {
      languages: Object.fromEntries(locales.map(locale => [locale, `${siteConfig.baseUrl}/${locale}`]))
    }
  }));
}
