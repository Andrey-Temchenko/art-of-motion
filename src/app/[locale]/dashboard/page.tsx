import React from 'react';

import {getUserProfile} from '@/lib/supabase/session';

export default async function DashboardPage() {
  const {profile} = await getUserProfile();

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-foreground">Dashboard</h1>
      <p className="text-muted-foreground text-lg">
        Welcome, <span className="text-foreground font-bold">{profile?.full_name || 'Client'}</span>! This is your
        secure dashboard.
      </p>

      {/* Temporary placeholder for tickets to come */}
      <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
        <h2 className="text-h2 text-foreground mb-4">Your Schedule</h2>
        <p className="text-muted-foreground">No upcoming bookings yet.</p>
      </div>
    </div>
  );
}
