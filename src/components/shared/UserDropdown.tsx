'use client';

import {useRouter} from 'next/navigation';
import React from 'react';

import type {User} from '@supabase/supabase-js';

import {getDefaultDashboardRoute, buildRoute} from '@/config/navigation';

import {USER_ROLE} from '@/constants/roles';

import {useDictionary} from '@/providers/dictionaryProvider';

import {useSignOut} from '@/hooks/useSignOut';

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
}

export function UserDropdown({user, role, locale}: UserDropdownProps) {
  const dict = useDictionary();
  const router = useRouter();

  const {handleSignOut} = useSignOut();

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
          {role === USER_ROLE.ADMIN ? dict.nav.adminPanel : dict.nav.dashboard}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleSignOut(locale)} className="cursor-pointer" variant="destructive">
          {dict.auth.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
