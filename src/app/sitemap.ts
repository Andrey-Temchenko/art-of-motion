import type {MetadataRoute} from 'next';
import {locales} from '@/lib/i18n/config';
import {siteConfig} from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map(locale => ({
    url: `${siteConfig.baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 1.0,
    alternates: {
      languages: Object.fromEntries(locales.map(l => [l, `${siteConfig.baseUrl}/${l}`]))
    }
  }));
}
