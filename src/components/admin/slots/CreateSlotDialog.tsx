'use client';

import React, {useState} from 'react';

import {PlusIcon} from 'lucide-react';

import {useDictionary} from '@/providers/dictionaryProvider';

import type {WorkoutType} from '@/components/shared/SlotForm';
import {SlotForm} from '@/components/shared/SlotForm';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';

interface CreateSlotDialogProps {
  workoutTypes: WorkoutType[];
  locationOptions: {value: string; label: string}[];
}

export function CreateSlotDialog({workoutTypes, locationOptions}: CreateSlotDialogProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotsPage;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="mr-2 h-4 w-4" />
        {dict.createSlot}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dict.createSlot}</DialogTitle>
        </DialogHeader>
        <SlotForm workoutTypes={workoutTypes} locationOptions={locationOptions} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
