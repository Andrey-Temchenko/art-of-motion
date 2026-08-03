'use client';

import React, {useState} from 'react';

import {DATE_FORMATS} from '@/constants/dateFormats';
import {formatDate} from '@/lib/utils/date';
import {ProcessedUpcomingOccurrence} from '@/services/types';
import {useDictionary} from '@/providers/dictionaryProvider';
import {ClubLocationType} from '@/constants/locations';
import {CreateSlotInput} from '@/lib/validators/slots';

import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import {SlotForm, WorkoutType} from '@/components/admin/SlotForm';

interface ConfirmOccurrenceDialogProps {
  occurrence: ProcessedUpcomingOccurrence;
  workoutTypes: WorkoutType[];
  locationOptions: {value: string; label: string}[];
}

export function ConfirmOccurrenceDialog({occurrence, workoutTypes, locationOptions}: ConfirmOccurrenceDialogProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotTemplatesPage.upcoming;
  const [open, setOpen] = useState(false);

  // We need to provide the SlotForm with the initial data formatted according to CreateSlotInput
  // which uses ISO strings for start/end times.
  const initialData: CreateSlotInput = {
    workout_type_id: occurrence.workout_type_id,
    location: occurrence.location as ClubLocationType,
    start_time: occurrence.startUtc,
    end_time: occurrence.endUtc,
    max_capacity: occurrence.max_capacity,
    price: occurrence.price,
    cancellation_deadline_hours: occurrence.cancellation_deadline_hours,
    slot_template_id: occurrence.templateId
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>{dict.confirm}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.confirmTitle}</DialogTitle>
          <DialogDescription>{dict.confirmDesc}</DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 text-muted-foreground mb-4 rounded-md border p-3 text-sm">
          <p className="text-foreground mb-1 font-medium">
            {formatDate(new Date(occurrence.occurrenceDate), DATE_FORMATS.DISPLAY_DATE_SHORT)} -{' '}
            {occurrence.start_time_local.slice(0, 5)}
          </p>
          <p>{occurrence.workout_title_key}</p>
        </div>

        <SlotForm
          workoutTypes={workoutTypes}
          locationOptions={locationOptions}
          initialData={initialData}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
