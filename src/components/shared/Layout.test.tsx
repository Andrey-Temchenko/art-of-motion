import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {Layout} from './Layout';
import type {Dictionary} from '@/lib/i18n/types';
import type {Locale} from '@/lib/i18n/config';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({push: vi.fn()}),
  usePathname: () => '/en/dashboard'
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({data: {user: null}}),
      onAuthStateChange: vi.fn().mockReturnValue({data: {subscription: {unsubscribe: vi.fn()}}}),
      signOut: vi.fn()
    }
  })
}));

vi.mock('@/actions/auth', () => ({
  signOut: vi.fn()
}));

const mockDict = {
  auth: {
    logout: 'Log out'
  }
} as Dictionary;

describe('Layout component', () => {
  it('renders children correctly', () => {
    render(
      <Layout navItems={[]} dict={mockDict} locale={'en' as Locale}>
        <div data-testid="child-content">Test Child Content</div>
      </Layout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders sidebar navigation items', () => {
    const navItems = [
      {label: 'Dashboard', href: '/dashboard'},
      {label: 'Settings', href: '/settings'}
    ];

    render(
      <Layout navItems={navItems} dict={mockDict} locale={'en' as Locale}>
        <div>Content</div>
      </Layout>
    );

    // Desktop sidebar has these links
    const dashboardLinks = screen.getAllByText('Dashboard');
    expect(dashboardLinks.length).toBeGreaterThan(0);

    const settingsLinks = screen.getAllByText('Settings');
    expect(settingsLinks.length).toBeGreaterThan(0);
  });
});
