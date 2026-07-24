'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {User} from '@supabase/supabase-js';

import {createClient} from '@/lib/supabase/client';
import {signOut} from '@/actions/auth';
import {USER_ROLES} from '@/lib/supabase/constants';
import type {Dictionary} from '@/lib/i18n/types';
import {ROUTES, getDefaultDashboardRoute, buildRoute} from '@/config/navigation';

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface UserDropdownProps {
  user: User;
  role: string;
  locale: string;
  dict: Dictionary;
}

export function UserDropdown({user, role, locale, dict}: UserDropdownProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await signOut();
    router.push(buildRoute(locale, ROUTES.MARKETING.HOME));
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fullName = user.user_metadata?.full_name || user.email || 'User';
  const dashboardRoute = getDefaultDashboardRoute(role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-ring relative h-10 w-10 cursor-pointer rounded-full border-none bg-transparent p-0 focus:outline-none focus-visible:ring-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.user_metadata?.avatar_url} alt={fullName} />
          <AvatarFallback>{getInitials(user.user_metadata?.full_name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm leading-none font-medium">{fullName}</p>
              <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(buildRoute(locale, dashboardRoute))} className="cursor-pointer">
          {role === USER_ROLES.ADMIN ? dict.nav.adminPanel : dict.nav.dashboard}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer" variant="destructive">
          {dict.auth.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
