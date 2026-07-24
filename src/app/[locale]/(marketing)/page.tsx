import type {JSX} from 'react';

import {getDictionary} from '@/lib/i18n/getDictionary';
import type {Locale} from '@/lib/i18n/config';
import {siteConfig} from '@/config/site';

import {HeroSection} from '@/components/marketing/HeroSection';
import {AboutSection} from '@/components/marketing/AboutSection';
import {DisciplinesSection} from '@/components/marketing/DisciplinesSection';
import {GallerySection} from '@/components/marketing/GallerySection';
import {TestimonialsSection} from '@/components/marketing/TestimonialsSection';
import {ContactSection} from '@/components/marketing/ContactSection';

export default async function LandingPage({params}: {params: Promise<{locale: string}>}): Promise<JSX.Element> {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);

  // JSON-LD structured data
  const baseUrl = siteConfig.baseUrl;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ArtOfMotion',
    description: dict.meta.description,
    url: `${baseUrl}/${locale}`,
    // Links to official social profiles
    sameAs: [siteConfig.links.instagram, siteConfig.links.telegram].filter(Boolean)
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}}
      />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <HeroSection dict={dict} locale={locale as Locale} />
        <AboutSection dict={dict} />
        <DisciplinesSection dict={dict} />
        <GallerySection dict={dict} />
        <TestimonialsSection dict={dict} />
        <ContactSection dict={dict} />
      </div>
    </>
  );
}
