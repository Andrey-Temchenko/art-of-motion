import Image from 'next/image';
import Link from 'next/link';

import {Send} from 'lucide-react';

import {ROUTES, buildRoute} from '@/config/navigation';
import {siteConfig} from '@/config/site';

import type {Locale} from '@/lib/i18n/config';
import {getDictionary} from '@/lib/i18n/getDictionary';

function InstagramIcon({className}: {className?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export async function SiteFooter({locale}: {locale: Locale}) {
  const dict = await getDictionary(locale);
  const currentYear = new Date().getFullYear();

  const homeRoute = buildRoute(locale, ROUTES.MARKETING.HOME);

  const navLinks = [
    {href: `${homeRoute}#about`, label: dict.nav.about},
    {href: `${homeRoute}#disciplines`, label: dict.nav.services},
    {href: `${homeRoute}#gallery`, label: dict.nav.gallery},
    {href: `${homeRoute}#contact`, label: dict.nav.contact}
  ];

  return (
    <footer className="bg-secondary border-border/50 border-t">
      <div className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href={homeRoute} className="group flex items-center gap-2.5">
              <div className="relative size-8 overflow-hidden rounded-full">
                <Image src="/logo.png" alt="ArtOfMotion logo" fill sizes="32px" className="object-cover" />
              </div>
              <span className="text-foreground text-lg font-bold tracking-tight">
                ArtOf<span className="text-primary">Motion</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">{dict.footer.brandTagline}</p>
          </div>

          {/* Navigation Column */}
          <div className="space-y-4">
            <h3 className="text-foreground text-sm font-bold tracking-wider uppercase">{dict.footer.navTitle}</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2.5">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Social Column */}
          <div className="space-y-4">
            <h3 className="text-foreground text-sm font-bold tracking-wider uppercase">{dict.footer.socialTitle}</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={siteConfig.links.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary flex items-center gap-2.5 text-sm font-medium transition-colors">
                  <InstagramIcon className="size-4" />
                  {dict.footer.instagram}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary flex items-center gap-2.5 text-sm font-medium transition-colors">
                  <Send className="size-4" />
                  {dict.footer.telegram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-border/50 mt-10 border-t pt-6 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            &copy; {currentYear} {dict.footer.trainerName}. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
