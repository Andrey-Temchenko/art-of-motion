import type {JSX} from 'react';

import {siteConfig} from '@/config/site';

import type {Locale} from '@/lib/i18n/config';
import {getDictionary} from '@/lib/i18n/getDictionary';

import {AboutSection} from '@/components/marketing/AboutSection';
import {ContactSection} from '@/components/marketing/ContactSection';
import {DisciplinesSection} from '@/components/marketing/DisciplinesSection';
import {GallerySection} from '@/components/marketing/GallerySection';
import {HeroSection} from '@/components/marketing/hero_section/HeroSection';
import {TestimonialsSection} from '@/components/marketing/TestimonialsSection';

export default async function LandingPage({params}: {params: Promise<{locale: string}>}): Promise<JSX.Element> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  const dict = await getDictionary(locale);

  const baseUrl = siteConfig.baseUrl;
  const pageUrl = `${baseUrl}/${locale}`;

  // Build localized service list from dictionary for JSON-LD
  const personalServices = [
    dict.disciplines.personal.items.stretching,
    dict.disciplines.personal.items.hotIron,
    dict.disciplines.personal.items.gym
  ];
  const groupServices = [
    dict.disciplines.group.items.strength,
    dict.disciplines.group.items.stretch,
    dict.disciplines.group.items.boards,
    dict.disciplines.group.items.trx,
    dict.disciplines.group.items.mfr
  ];
  const allServices = [...personalServices, ...groupServices];

  // Rich JSON-LD structured data with @graph for maximum SEO impact
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Local Business - critical for local search (Google Maps, "3-pack")
      {
        '@type': 'HealthAndBeautyBusiness',
        '@id': `${baseUrl}/#business`,
        name: 'ArtOfMotion',
        description: dict.meta.description,
        url: pageUrl,
        image: siteConfig.images.hero,
        priceRange: '$$',
        sameAs: [siteConfig.links.instagram, siteConfig.links.telegram].filter(Boolean),
        location: [
          {
            '@type': 'Place',
            name: 'ALFA Elit Fitness',
            address: {
              '@type': 'PostalAddress',
              streetAddress: dict.meta.address,
              addressLocality: dict.meta.city,
              addressCountry: 'UA'
            },
            geo: siteConfig.clubs.alfa.geo
              ? {
                  '@type': 'GeoCoordinates',
                  latitude: siteConfig.clubs.alfa.geo.latitude,
                  longitude: siteConfig.clubs.alfa.geo.longitude
                }
              : undefined,
            openingHoursSpecification: siteConfig.clubs.alfa.openingHours.map(hours => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: hours.dayOfWeek,
              opens: hours.opens,
              closes: hours.closes
            }))
          },
          {
            '@type': 'Place',
            name: 'TOP GUN Fitness Club',
            address: {
              '@type': 'PostalAddress',
              streetAddress: dict.meta.address,
              addressLocality: dict.meta.city,
              addressCountry: 'UA'
            },
            openingHoursSpecification: siteConfig.clubs.top_gun.openingHours.map(hours => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: hours.dayOfWeek,
              opens: hours.opens,
              closes: hours.closes
            }))
          }
        ]
      },
      // 2. Person - trainer profile for Knowledge Panel
      {
        '@type': 'Person',
        '@id': `${baseUrl}/#trainer`,
        name: dict.meta.trainerName,
        jobTitle: dict.meta.trainerTitle,
        worksFor: {'@id': `${baseUrl}/#business`},
        sameAs: [siteConfig.links.instagram, siteConfig.links.telegram].filter(Boolean),
        image: siteConfig.images.about
      },
      // 3. Services - for rich snippets per training type
      ...allServices.map(service => ({
        '@type': 'Service',
        name: service.title,
        description: service.description,
        provider: {'@id': `${baseUrl}/#business`}
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}}
      />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <HeroSection locale={locale} />
        <AboutSection locale={locale} />
        <DisciplinesSection locale={locale} />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
      </div>
    </>
  );
}
