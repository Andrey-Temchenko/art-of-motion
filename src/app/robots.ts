import type {MetadataRoute} from 'next';

import {siteConfig} from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/login/',
          '/register/',
          '/reset-password/',
          '/*/admin/',
          '/*/dashboard/',
          '/*/login/',
          '/*/register/',
          '/*/reset-password/'
        ]
      }
    ],
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`
  };
}
