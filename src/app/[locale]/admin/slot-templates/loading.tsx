import React from 'react';

export default function SlotTemplatesLoading() {
  return (
    <div className="animate-pulse space-y-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-64 rounded-md"></div>
          <div className="bg-muted h-4 w-96 rounded-md"></div>
        </div>
        <div className="bg-muted h-10 w-32 rounded-md"></div>
      </div>

      <div className="space-y-8">
        <div className="rounded-md border p-4">
          <div className="bg-muted mb-4 h-8 w-full rounded-md"></div>
          <div className="space-y-2">
            {Array.from({length: 3}).map((_, i) => (
              <div key={i} className="bg-muted/50 h-12 w-full rounded-md"></div>
            ))}
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="bg-muted h-6 w-48 rounded-md"></div>
            <div className="bg-muted h-10 w-48 rounded-md"></div>
          </div>
          <div className="rounded-md border p-4">
            <div className="bg-muted mb-4 h-8 w-full rounded-md"></div>
            <div className="space-y-2">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="bg-muted/50 h-12 w-full rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
