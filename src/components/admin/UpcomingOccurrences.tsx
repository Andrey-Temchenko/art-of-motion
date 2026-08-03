'use client';

import React, {useTransition} from 'react';
import {DATE_FORMATS} from '@/constants/dateFormats';
import {useRouter, usePathname} from 'next/navigation';

import {ProcessedUpcomingOccurrence} from '@/services/types';
import {useDictionary} from '@/providers/dictionaryProvider';
import {parseLocalDate, formatDate} from '@/lib/utils/date';
import {ConfirmOccurrenceDialog} from './ConfirmOccurrenceDialog';
import {WorkoutType} from '@/components/admin/SlotForm';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

interface UpcomingOccurrencesProps {
  occurrences: ProcessedUpcomingOccurrence[];
  workoutTypes: WorkoutType[];
  locationOptions: {value: string; label: string}[];
  currentWeeksAhead: number;
}

export function UpcomingOccurrences({
  occurrences,
  workoutTypes,
  locationOptions,
  currentWeeksAhead
}: UpcomingOccurrencesProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotTemplatesPage.upcoming;
  const daysOfWeek = dictionary.admin.slotTemplatesPage.daysOfWeek as Record<string, string>;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleWeeksChange = (val: string | null) => {
    if (!val) return;
    startTransition(() => {
      // We will append ?weeks=N to the URL so the server can fetch more
      const params = new URLSearchParams(window.location.search);
      params.set('weeks', val);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const WEEKS_OPTIONS = [2, 4, 6, 8, 12];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{dict.title}</h3>
        <div className="flex items-center gap-2">
          <Select value={currentWeeksAhead.toString()} onValueChange={handleWeeksChange} disabled={isPending}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WEEKS_OPTIONS.map(w => (
                <SelectItem key={w} value={w.toString()}>
                  {dict.weeksAhead.replace('{n}', w.toString())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {occurrences.length === 0 ? (
        <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center">
          {dict.noOccurrences}
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">{dict.date}</th>
                  <th className="p-4 font-medium">{dict.day}</th>
                  <th className="p-4 font-medium">{dict.time}</th>
                  <th className="p-4 font-medium">{dict.workout}</th>
                  <th className="p-4 font-medium">{dict.location}</th>
                  <th className="p-4 font-medium">{dict.capacity}</th>
                  <th className="p-4 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {occurrences.map(occ => {
                  const locationLabel = locationOptions.find(l => l.value === occ.location)?.label || occ.location;
                  const dateObj = parseLocalDate(occ.occurrenceDate);

                  return (
                    <tr key={`${occ.templateId}-${occ.occurrenceDate}`} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{formatDate(dateObj, DATE_FORMATS.DISPLAY_DATE_SHORT)}</td>
                      <td className="text-muted-foreground p-4">{daysOfWeek[dateObj.getDay().toString()]}</td>
                      <td className="p-4">{occ.start_time_local.slice(0, 5)}</td>
                      <td className="p-4">{occ.workout_title_key}</td>
                      <td className="p-4">{locationLabel}</td>
                      <td className="p-4">{occ.max_capacity}</td>
                      <td className="p-4 text-right">
                        <ConfirmOccurrenceDialog
                          occurrence={occ}
                          workoutTypes={workoutTypes}
                          locationOptions={locationOptions}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
