'use client';

import React, {useState} from 'react';
import {PlusIcon} from 'lucide-react';

import {ProcessedAdminSlot} from '@/services/types';

import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {SlotForm, WorkoutType} from '@/components/admin/SlotForm';

interface CreateSlotDialogProps {
  workoutTypes: WorkoutType[];
  locationOptions: {value: string; label: string}[];
  existingSlots: ProcessedAdminSlot[];
  dict: Record<string, string>;
  buttonText: string;
  title: string;
}

export function CreateSlotDialog({
  workoutTypes,
  locationOptions,
  existingSlots,
  dict,
  buttonText,
  title
}: CreateSlotDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="mr-2 h-4 w-4" />
        {buttonText}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SlotForm
          workoutTypes={workoutTypes}
          locationOptions={locationOptions}
          existingSlots={existingSlots}
          dict={dict}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
