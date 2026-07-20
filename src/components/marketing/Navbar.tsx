'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {Menu} from 'lucide-react';

import type {Dictionary} from '@/lib/i18n/types';
import type {Locale} from '@/lib/i18n/config';
import {cn} from '@/lib/utils';

import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose} from '@/components/ui/sheet';
import {LanguageSwitcher} from '@/components/marketing/LanguageSwitcher';

interface NavbarProps {
  dict: Dictionary;
  locale: Locale;
}

const NAV_SCROLL_THRESHOLD = 20;

export function Navbar({dict, locale}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > NAV_SCROLL_THRESHOLD);
    handleScroll(); // initialise on mount
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {href: `/${locale}#about`, label: dict.nav.about},
    {href: `/${locale}#disciplines`, label: dict.nav.services},
    {href: `/${locale}#gallery`, label: dict.nav.gallery},
    {href: `/${locale}#contact`, label: dict.nav.contact}
  ];

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        isScrolled
          ? 'border-border/40 bg-background/70 border-b py-3 shadow-sm backdrop-blur-xl backdrop-saturate-150'
          : 'bg-transparent py-4 md:py-5'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 md:px-10">
        {/* Logo */}
        <Link href={`/${locale}`} className="group flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-full md:h-10 md:w-10">
            <Image
              src="/logo.png"
              alt="ArtOfMotion logo"
              fill
              sizes="40px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight md:text-xl">
            ArtOf<span className="text-primary">Motion</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:flex lg:gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary text-sm font-medium tracking-wider uppercase transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <LanguageSwitcher current={locale} />

          <Button
            className="hidden cursor-pointer rounded-full px-5 py-2.5 font-medium lg:inline-flex"
            render={<Link href={`/${locale}#contact`} />}
            nativeButton={false}
          >
            {dict.nav.cta}
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="border-border border-b px-6 py-5">
            <SheetTitle className="flex items-center gap-2.5">
              <div className="relative size-8 overflow-hidden rounded-full">
                <Image src="/logo.png" alt="ArtOfMotion logo" fill sizes="32px" className="object-cover" />
              </div>
              <span className="text-foreground text-lg font-bold tracking-tight">
                ArtOf<span className="text-primary">Motion</span>
              </span>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map(link => (
              <SheetClose key={link.href} render={<Link href={link.href} />}>
                <span className="text-foreground hover:bg-muted block rounded-lg px-3 py-3 text-base font-medium transition-colors">
                  {link.label}
                </span>
              </SheetClose>
            ))}
          </nav>

          <div className="border-border mt-auto border-t px-6 py-5">
            <Button
              className="w-full cursor-pointer rounded-full font-medium"
              render={<Link href={`/${locale}#contact`} />}
              nativeButton={false}
              onClick={() => setMobileOpen(false)}
            >
              {dict.nav.cta}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
