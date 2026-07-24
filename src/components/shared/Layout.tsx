'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {Menu} from 'lucide-react';
import type {User} from '@supabase/supabase-js';

import type {Dictionary} from '@/lib/i18n/types';
import type {Locale} from '@/lib/i18n/config';
import {cn} from '@/lib/utils';
import {USER_ROLES} from '@/lib/supabase/constants';
import {buildRoute, isRouteActive} from '@/config/navigation';

import {UserDropdown} from '@/components/shared/UserDropdown';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import {LanguageSwitcher} from '@/components/marketing/LanguageSwitcher';
import {ThemeToggle} from '@/components/marketing/ThemeToggle';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface LayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  dict: Dictionary;
  locale: Locale;
  user?: User | null;
  role?: string | null;
}

export function Layout({children, navItems, dict, locale, user, role}: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const renderSidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href={buildRoute(locale, '/')} className="group flex items-center gap-2.5">
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image
              src="/logo.png"
              alt="ArtOfMotion logo"
              fill
              sizes="32px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight">
            ArtOf<span className="text-primary">Motion</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map(item => {
          const isActive = isRouteActive(pathname, item.href, locale);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}>
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="border-brand-stretch bg-card hidden w-64 flex-col border-r md:flex">
        {renderSidebarContent()}
      </aside>

      {/* Main Content wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="border-brand-stretch bg-background/80 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md md:justify-end md:px-8">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher current={locale} />
            <ThemeToggle />

            {user && <UserDropdown user={user} role={role || USER_ROLES.CLIENT} locale={locale} dict={dict} />}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
