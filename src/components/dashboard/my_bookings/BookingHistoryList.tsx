'use client';

import type {JSX} from 'react';
import React, {useState, useMemo} from 'react';

import {Button} from '@/components/ui/button';

const HISTORY_BATCH_SIZE = 3;

interface BookingHistoryListProps {
  children: React.ReactNode;
  loadMoreText: string;
}

export function BookingHistoryList({children, loadMoreText}: BookingHistoryListProps): JSX.Element {
  const [visibleCount, setVisibleCount] = useState(HISTORY_BATCH_SIZE);
  const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{childrenArray.slice(0, visibleCount)}</div>
      {visibleCount < childrenArray.length && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setVisibleCount(c => c + HISTORY_BATCH_SIZE)}>
            {loadMoreText}
          </Button>
        </div>
      )}
    </div>
  );
}
