import React from 'react';

import {getUserProfile} from '@/lib/supabase/session';

export default async function AdminPage() {
  const {profile} = await getUserProfile();

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-foreground">Admin Overview</h1>
      <p className="text-muted-foreground text-lg">
        Welcome back, <span className="text-foreground font-bold">{profile?.full_name}</span>. You have full access to
        manage the system.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
          <h3 className="text-h3 text-foreground mb-2">Total Users</h3>
          <p className="text-display">0</p>
        </div>
        <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
          <h3 className="text-h3 text-foreground mb-2">Active Bookings</h3>
          <p className="text-display">0</p>
        </div>
      </div>
    </div>
  );
}
