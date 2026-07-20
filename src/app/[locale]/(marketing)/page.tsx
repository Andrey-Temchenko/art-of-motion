import type {JSX} from 'react';

import {getDictionary} from '@/lib/i18n/get-dictionary';
import type {Locale} from '@/lib/i18n/config';

import {HeroSection} from '@/components/marketing/HeroSection';
import {AboutSection} from '@/components/marketing/AboutSection';
import {DisciplinesSection} from '@/components/marketing/DisciplinesSection';
import {GallerySection} from '@/components/marketing/GallerySection';
import {TestimonialsSection} from '@/components/marketing/TestimonialsSection';
import {ContactSection} from '@/components/marketing/ContactSection';

export default async function LandingPage({params}: {params: Promise<{locale: string}>}): Promise<JSX.Element> {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <HeroSection dict={dict} />
      <AboutSection dict={dict} />
      <DisciplinesSection dict={dict} />

      <GallerySection dict={dict} />

      <TestimonialsSection dict={dict} />
      <ContactSection dict={dict} />
    </div>
  );
}
