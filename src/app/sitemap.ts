import type {MetadataRoute} from 'next';

import {ROUTES, buildRoute} from '@/config/navigation';
import {siteConfig} from '@/config/site';

import {locales} from '@/lib/i18n/config';

const SECTIONS = ['#about', '#disciplines', '#gallery', '#testimonials', '#contact'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Main page for each locale (highest priority)
  for (const locale of locales) {
    const route = buildRoute(locale, ROUTES.MARKETING.HOME);
    entries.push({
      url: `${siteConfig.baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          locales.map(loc => [loc, `${siteConfig.baseUrl}${buildRoute(loc, ROUTES.MARKETING.HOME)}`])
        )
      }
    });
  }

  // Section anchors for each locale (secondary priority)
  for (const locale of locales) {
    for (const section of SECTIONS) {
      const priority = section === '#about' || section === '#disciplines' ? 0.8 : section === '#contact' ? 0.7 : 0.6;
      const route = buildRoute(locale, ROUTES.MARKETING.HOME);

      entries.push({
        url: `${siteConfig.baseUrl}${route}${section}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${siteConfig.baseUrl}${buildRoute(loc, ROUTES.MARKETING.HOME)}${section}`])
          )
        }
      });
    }
  }

  return entries;
}
