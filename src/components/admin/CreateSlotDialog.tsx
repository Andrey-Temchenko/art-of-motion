'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {SlotForm, WorkoutType} from '@/components/admin/SlotForm';
import {PlusIcon} from 'lucide-react';

interface CreateSlotDialogProps {
  workoutTypes: WorkoutType[];
  locationOptions: {value: string; label: string}[];
  dict: Record<string, string>;
  buttonText: string;
  title: string;
}

export function CreateSlotDialog({workoutTypes, locationOptions, dict, buttonText, title}: CreateSlotDialogProps) {
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
          dict={dict}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
