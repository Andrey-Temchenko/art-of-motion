'use client';

import React, {useState} from 'react';
import {PlusIcon} from 'lucide-react';

import {useDictionary} from '@/providers/dictionaryProvider';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import {TemplateForm, WorkoutTypeOption} from './components/TemplateForm';

interface CreateTemplateDialogProps {
  workoutTypes: WorkoutTypeOption[];
  locationOptions: {value: string; label: string}[];
}

export function CreateTemplateDialog({workoutTypes, locationOptions}: CreateTemplateDialogProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotTemplatesPage;
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="mr-2 h-4 w-4" />
        {dict.createTemplate}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dict.createTemplate}</DialogTitle>
          <DialogDescription className="sr-only">{dict.createTemplate}</DialogDescription>
        </DialogHeader>

        <TemplateForm workoutTypes={workoutTypes} locationOptions={locationOptions} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
