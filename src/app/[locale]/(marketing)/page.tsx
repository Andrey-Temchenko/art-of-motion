import type {JSX} from 'react';

import {getDictionary} from '@/lib/i18n/get-dictionary';
import type {Locale} from '@/lib/i18n/config';

import {HeroSection} from '@/components/marketing/HeroSection';

export default async function LandingPage({params}: {params: Promise<{locale: string}>}): Promise<JSX.Element> {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);

  const disciplines = [
    dict.disciplines.items.strength,
    dict.disciplines.items.stretching,
    dict.disciplines.items.mfr,
    dict.disciplines.items.balance
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <HeroSection dict={dict} />

      {/* About Section */}
      <section id="about" className="bg-secondary/50 py-[var(--spacing-section-sm)] sm:py-[var(--spacing-section)]">
        <div className="container mx-auto max-w-5xl space-y-6 px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-[var(--font-size-h2)]">{dict.about.heading}</h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">{dict.about.bio}</p>
        </div>
      </section>

      {/* Disciplines Section */}
      <section id="disciplines" className="py-[var(--spacing-section-sm)] sm:py-[var(--spacing-section)]">
        <div className="container mx-auto max-w-6xl space-y-12 px-4">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-[var(--font-size-h2)]">
              {dict.disciplines.heading}
            </h2>
            <p className="text-muted-foreground text-xl">{dict.disciplines.subheading}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {disciplines.map(item => (
              <div
                key={item.title}
                className="group border-border bg-card relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-2xl)] border p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative z-10 space-y-4">
                  <h3 className="group-hover:text-primary text-2xl font-bold tracking-tight transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-lg">{item.description}</p>
                </div>
                {/* Decorative background accent */}
                <div className="bg-primary/5 group-hover:bg-primary/10 absolute -right-24 -bottom-24 h-48 w-48 rounded-full blur-3xl transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Placeholder */}
      <section id="gallery" className="bg-muted/30 py-[var(--spacing-section-sm)]">
        <div className="container px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold">{dict.gallery.heading}</h2>
          <div className="border-border/50 text-muted-foreground flex h-64 items-center justify-center rounded-xl border-2 border-dashed">
            [ Gallery coming soon ]
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section id="testimonials" className="py-[var(--spacing-section-sm)]">
        <div className="container px-4 text-center">
          <h2 className="mb-8 text-3xl font-bold">{dict.testimonials.heading}</h2>
          <div className="border-border/50 text-muted-foreground flex h-40 items-center justify-center rounded-xl border-2 border-dashed">
            [ Testimonials coming soon ]
          </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <section id="contact" className="bg-card border-border border-t py-[var(--spacing-section)]">
        <div className="container mx-auto flex max-w-4xl flex-col items-center space-y-8 px-4 text-center">
          <h2 className="text-3xl font-bold">{dict.contact.heading}</h2>
          <p className="text-muted-foreground text-xl">{dict.contact.address}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://t.me/your_trainer_bot"
              className="bg-secondary hover:bg-secondary/80 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            >
              {dict.contact.telegram}
            </a>
            <a
              href="https://instagram.com/your_trainer"
              className="bg-secondary hover:bg-secondary/80 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            >
              {dict.contact.instagram}
            </a>
            <a
              href="https://wa.me/000000000"
              className="bg-secondary hover:bg-secondary/80 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            >
              {dict.contact.whatsapp}
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-background border-border text-muted-foreground border-t py-8 text-center text-sm">
        <div className="container">
          <p>{dict.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}
