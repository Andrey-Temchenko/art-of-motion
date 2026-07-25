import React, {JSX} from 'react';

import {formatKyivTime} from '@/lib/utils/timezone';

export interface BookingCardProps {
  localizedTitle: string;
  startTime: string; // ISO string
  locationLabel: string;
  price: number;
  currencyLabel: string;
  dateLabel?: string;

  // Right side of the price row (optional)
  statsRight?: React.ReactNode;

  // Actions at the bottom
  children?: React.ReactNode;
}

export function BookingCard({
  localizedTitle,
  startTime,
  locationLabel,
  price,
  currencyLabel,
  dateLabel,
  statsRight,
  children
}: BookingCardProps): JSX.Element {
  return (
    <div className="bg-card flex flex-col justify-between rounded-lg border p-4 shadow-sm">
      <div className="mb-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium">{localizedTitle}</h3>
          <div className="flex items-center gap-2">
            {dateLabel && <span className="text-muted-foreground text-sm font-medium">{dateLabel}</span>}
            <span className="bg-primary/10 text-primary rounded px-2 py-1 text-sm font-semibold">
              {formatKyivTime(startTime, 'HH:mm')}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">{locationLabel}</p>
        <div className="flex items-center justify-between text-sm">
          <span>
            {price} {currencyLabel}
          </span>
          {statsRight && (
            <span className={typeof statsRight === 'string' ? 'text-muted-foreground' : undefined}>{statsRight}</span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
