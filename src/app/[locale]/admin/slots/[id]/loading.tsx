import React from 'react';

export default async function SlotDetailsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="bg-muted h-9 w-64 animate-pulse rounded-md"></div>
        <div className="bg-muted mt-2 h-5 w-48 animate-pulse rounded-md"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card space-y-4 rounded-xl border p-6 shadow">
          <div className="flex items-center justify-between">
            <div className="bg-muted h-7 w-32 animate-pulse rounded-md"></div>
            <div className="bg-muted h-6 w-16 animate-pulse rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="bg-muted h-5 w-40 animate-pulse rounded-md"></div>
            <div className="bg-muted h-5 w-24 animate-pulse rounded-md"></div>
            <div className="bg-muted h-5 w-20 animate-pulse rounded-md"></div>
            <div className="bg-muted h-5 w-32 animate-pulse rounded-md"></div>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-8">
        <div className="flex items-center justify-center">
          <div className="bg-muted h-5 w-40 animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
