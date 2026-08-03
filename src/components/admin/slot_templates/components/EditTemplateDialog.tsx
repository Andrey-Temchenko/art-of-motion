'use client';

import React, {useState} from 'react';
import {PencilIcon} from 'lucide-react';

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
import {TemplateForm, WorkoutTypeOption} from './TemplateForm';
import {ProcessedSlotTemplate} from '@/services/types';
import {ClubLocationType} from '@/constants/locations';

interface EditTemplateDialogProps {
  template: ProcessedSlotTemplate;
  workoutTypes: WorkoutTypeOption[];
  locationOptions: {value: string; label: string}[];
}

export function EditTemplateDialog({template, workoutTypes, locationOptions}: EditTemplateDialogProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotTemplatesPage;
  const [open, setOpen] = useState(false);

  const initialData = {
    workout_type_id: template.workout_type_id,
    location: template.location as ClubLocationType,
    day_of_week: template.day_of_week,
    start_time_local: template.start_time_local,
    duration_minutes: template.duration_minutes,
    max_capacity: template.max_capacity,
    price: template.price,
    cancellation_deadline_hours: template.cancellation_deadline_hours,
    recurrence_start_date: template.recurrence_start_date,
    recurrence_end_date: template.recurrence_end_date
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilIcon className="mr-2 h-4 w-4" />
        {dict.editTemplate}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dict.editTemplate}</DialogTitle>
          <DialogDescription className="sr-only">{dict.editTemplate}</DialogDescription>
        </DialogHeader>

        <TemplateForm
          templateId={template.id}
          initialData={initialData}
          workoutTypes={workoutTypes}
          locationOptions={locationOptions}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
