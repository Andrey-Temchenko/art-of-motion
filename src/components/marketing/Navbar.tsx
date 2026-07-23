'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Menu, LogOut} from 'lucide-react';
import type {User} from '@supabase/supabase-js';

import type {Dictionary} from '@/lib/i18n/types';
import type {Locale} from '@/lib/i18n/config';
import {cn} from '@/lib/utils';
import {createClient} from '@/lib/supabase/client';
import {signOut} from '@/actions/auth';

import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose} from '@/components/ui/sheet';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {LanguageSwitcher} from '@/components/marketing/LanguageSwitcher';
import {ThemeToggle} from '@/components/marketing/ThemeToggle';

interface NavbarProps {
  dict: Dictionary;
  locale: Locale;
}

const NAV_SCROLL_THRESHOLD = 20;

export function Navbar({dict, locale}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut(); // Clear client state
    await signOut(); // Clear server cookies
    router.refresh();
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > NAV_SCROLL_THRESHOLD);
    handleScroll(); // initialise on mount
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const {data} = await supabase.auth.getUser();
      setUser(data.user);
      setIsAuthLoading(false);
    };
    fetchUser();

    const {data: authListener} = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      <div className="mx-auto flex w-full items-center justify-between px-6 md:px-12 lg:px-16">
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
          <span className="text-foreground hidden text-lg font-bold tracking-tight sm:inline-block md:text-xl">
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
          <ThemeToggle />

          {isAuthLoading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus-visible:ring-ring relative hidden h-10 w-10 cursor-pointer rounded-full border-none bg-transparent p-0 focus:outline-none focus-visible:ring-2 lg:flex">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                  <AvatarFallback>{getInitials(user.user_metadata?.full_name)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer" variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {dict.auth?.logout || 'Log out'}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="hidden cursor-pointer rounded-full px-5 py-2.5 font-medium lg:inline-flex"
              render={<Link href={`/${locale}/login`} />}
              nativeButton={false}
            >
              {dict.auth?.login || 'Log in'}
            </Button>
          )}

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
              <SheetClose key={link.href} render={<Link href={link.href} />} nativeButton={false}>
                <span className="text-foreground hover:bg-muted block rounded-lg px-3 py-3 text-base font-medium transition-colors">
                  {link.label}
                </span>
              </SheetClose>
            ))}
          </nav>

          <div className="border-border mt-auto border-t px-6 py-5">
            {isAuthLoading ? null : user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                    <AvatarFallback>{getInitials(user.user_metadata?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm leading-none font-medium">{user.user_metadata?.full_name || 'User'}</p>
                    <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full cursor-pointer rounded-full font-medium"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {dict.auth?.logout || 'Log out'}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full cursor-pointer rounded-full font-medium"
                render={<Link href={`/${locale}/login`} />}
                nativeButton={false}
                onClick={() => setMobileOpen(false)}
              >
                {dict.auth?.login || 'Log in'}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
