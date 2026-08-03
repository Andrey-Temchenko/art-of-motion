'use client';

import React, {useState} from 'react';

import {PencilIcon} from 'lucide-react';

import type {ClubLocationType} from '@/constants/locations';

import {useDictionary} from '@/providers/dictionaryProvider';

import type {ProcessedAdminSlotDetails} from '@/services/types';

import type {WorkoutType} from '@/components/shared/SlotForm';
import {SlotForm} from '@/components/shared/SlotForm';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';

interface EditSlotDialogProps {
  slot: ProcessedAdminSlotDetails;
  workoutTypes: WorkoutType[];
  locationOptions: {value: string; label: string}[];
}

export function EditSlotDialog({slot, workoutTypes, locationOptions}: EditSlotDialogProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotDetailsPage;
  const [open, setOpen] = useState(false);

  const initialData = {
    workout_type_id: slot.workout_type_id,
    location: slot.location as ClubLocationType,
    max_capacity: slot.max_capacity,
    price: slot.price,
    start_time: slot.start_time,
    end_time: slot.end_time
  };

  const hasBookings = slot.bookings.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" data-testid="edit-slot-btn" />}>
        <PencilIcon className="mr-2 h-4 w-4" />
        {dict.editSlot}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle data-testid="edit-dialog-title">{dict.editDialog.title}</DialogTitle>
          <DialogDescription>{dict.editDialog.desc}</DialogDescription>
        </DialogHeader>

        {hasBookings && (
          <div className="mb-4 space-y-2">
            <div
              className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
              data-testid="edit-dialog-time-warning">
              {dict.editDialog.timeWarning}
            </div>
            <div
              className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
              data-testid="edit-dialog-price-warning">
              {dict.editDialog.priceWarning}
            </div>
          </div>
        )}

        <SlotForm
          workoutTypes={workoutTypes}
          locationOptions={locationOptions}
          slotId={slot.id}
          initialData={initialData}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
