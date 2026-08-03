'use client';

import React, {useTransition} from 'react';

import {Trash2Icon} from 'lucide-react';
import {toast} from 'sonner';

import {DATE_FORMATS} from '@/constants/dateFormats';

import {formatDate} from '@/lib/utils/date';

import {useDictionary} from '@/providers/dictionaryProvider';

import type {ProcessedSlotTemplate} from '@/services/types';

import {toggleSlotTemplateActiveAction, deleteSlotTemplateAction} from '@/actions/adminSlotTemplates';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';

import {EditTemplateDialog} from './components/EditTemplateDialog';
import type {WorkoutTypeOption} from './components/TemplateForm';

interface TemplatesTableProps {
  templates: ProcessedSlotTemplate[];
  workoutTypes: WorkoutTypeOption[];
  locationOptions: {value: string; label: string}[];
}

export function TemplatesTable({templates, workoutTypes, locationOptions}: TemplatesTableProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotTemplatesPage;
  const daysOfWeek = dict.daysOfWeek as Record<string, string>;
  const [isPending, startTransition] = useTransition();

  const handleToggleActive = (id: string) => {
    startTransition(async () => {
      const result = await toggleSlotTemplateActiveAction(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Error');
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteSlotTemplateAction(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Error');
      }
    });
  };

  if (templates.length === 0) {
    return (
      <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center">{dict.noTemplates}</div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">{dict.table.workout}</th>
              <th className="p-4 font-medium">{dict.table.location}</th>
              <th className="p-4 font-medium">{dict.table.day}</th>
              <th className="p-4 font-medium">{dict.table.time}</th>
              <th className="p-4 font-medium">{dict.table.duration}</th>
              <th className="p-4 font-medium">{dict.table.capacity}</th>
              <th className="p-4 font-medium">{dict.table.price}</th>
              <th className="p-4 font-medium">{dict.table.period}</th>
              <th className="p-4 font-medium">{dict.table.status}</th>
              <th className="p-4 text-right font-medium">{dict.table.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {templates.map(template => {
              const locationLabel =
                locationOptions.find(l => l.value === template.location)?.label || template.location;

              return (
                <tr key={template.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium">{template.workout_title_key}</td>
                  <td className="p-4">{locationLabel}</td>
                  <td className="p-4">{daysOfWeek[template.day_of_week.toString()]}</td>
                  <td className="p-4">{template.start_time_local.slice(0, 5)}</td>
                  <td className="p-4">{template.duration_minutes}</td>
                  <td className="p-4">{template.max_capacity}</td>
                  <td className="p-4">{template.price} ₴</td>
                  <td className="text-muted-foreground p-4 text-xs whitespace-nowrap">
                    <div>{formatDate(new Date(template.recurrence_start_date), DATE_FORMATS.DISPLAY_DATE_SHORT)}</div>
                    <div>
                      -{' '}
                      {template.recurrence_end_date
                        ? formatDate(new Date(template.recurrence_end_date), DATE_FORMATS.DISPLAY_DATE_SHORT)
                        : dict.indefinite}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={() => handleToggleActive(template.id)}
                        disabled={isPending}
                      />
                      <Badge variant={template.is_active ? 'default' : 'secondary'} className="w-20 justify-center">
                        {template.is_active ? dict.active : dict.inactive}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <EditTemplateDialog
                        template={template}
                        workoutTypes={workoutTypes}
                        locationOptions={locationOptions}
                      />

                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="destructive" size="sm" disabled={isPending} />}>
                          <Trash2Icon className="h-4 w-4" />
                          <span className="sr-only">{dict.deleteTemplate}</span>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{dict.deleteConfirmTitle}</AlertDialogTitle>
                            <AlertDialogDescription>{dict.deleteConfirmDesc}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{dict.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(template.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              {dict.deleteTemplate}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
