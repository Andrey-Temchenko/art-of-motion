import React from 'react';

export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-muted h-10 w-1/3 rounded"></div>
      <div className="bg-muted h-6 w-1/2 rounded"></div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-border bg-card h-32 rounded-2xl border"></div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-border bg-card h-[400px] rounded-2xl border"></div>
        <div className="border-border bg-card h-[400px] rounded-2xl border"></div>
      </div>
    </div>
  );
}
