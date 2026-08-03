'use client';

import React, {useState, useTransition} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {CalendarIcon} from 'lucide-react';
import {useForm, useWatch} from 'react-hook-form';
import {toast} from 'sonner';

import {DATE_FORMATS} from '@/constants/dateFormats';
import {DAY_OF_WEEK_VALUES} from '@/constants/dayOfWeek';
import type {ClubLocationType} from '@/constants/locations';
import {CLUB_LOCATION_VALUES} from '@/constants/locations';

import {cn} from '@/lib/utils';
import {parseLocalDate, formatDate} from '@/lib/utils/date';
import type {SlotTemplateInput} from '@/lib/validators/slotTemplates';
import {slotTemplateSchema} from '@/lib/validators/slotTemplates';

import {useDictionary} from '@/providers/dictionaryProvider';

import {createSlotTemplateAction, updateSlotTemplateAction} from '@/actions/adminSlotTemplates';

import {Button, buttonVariants} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

export type WorkoutTypeOption = {
  id: string;
  title: string;
  duration_minutes: number;
  default_price: number;
};

interface TemplateFormProps {
  workoutTypes: WorkoutTypeOption[];
  locationOptions: {value: string; label: string}[];
  templateId?: string;
  initialData?: SlotTemplateInput;
  onSuccess?: () => void;
}

export function TemplateForm({workoutTypes, locationOptions, templateId, initialData, onSuccess}: TemplateFormProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotTemplatesPage.form;
  const daysOfWeek = dictionary.admin.slotTemplatesPage.daysOfWeek as Record<string, string>;
  const [isPending, startTransition] = useTransition();

  const defaultLocation = locationOptions[0]?.value || CLUB_LOCATION_VALUES[0];

  const todayStr = formatDate(new Date(), DATE_FORMATS.ISO_DATE);

  const form = useForm<SlotTemplateInput>({
    resolver: zodResolver(slotTemplateSchema),
    defaultValues: initialData || {
      workout_type_id: '',
      location: defaultLocation as ClubLocationType,
      day_of_week: 1,
      start_time_local: '18:00',
      duration_minutes: 60,
      max_capacity: 1,
      price: 0,
      cancellation_deadline_hours: 24,
      recurrence_start_date: todayStr,
      recurrence_end_date: null
    }
  });

  const watchWorkoutTypeId = useWatch({control: form.control, name: 'workout_type_id'});
  const watchLocation = useWatch({control: form.control, name: 'location'});
  const watchDayOfWeek = useWatch({control: form.control, name: 'day_of_week'});

  const [startHour, setStartHour] = useState(initialData ? initialData.start_time_local.split(':')[0] : '18');
  const [startMinute, setStartMinute] = useState(initialData ? initialData.start_time_local.split(':')[1] : '00');
  const [isIndefinite, setIsIndefinite] = useState(initialData ? initialData.recurrence_end_date === null : true);

  const [recStartDate, setRecStartDate] = useState<Date | undefined>(
    initialData ? parseLocalDate(initialData.recurrence_start_date) : new Date()
  );
  const [recEndDate, setRecEndDate] = useState<Date | undefined>(
    initialData?.recurrence_end_date ? parseLocalDate(initialData.recurrence_end_date) : undefined
  );

  const handleWorkoutTypeChange = (id: string) => {
    form.setValue('workout_type_id', id, {shouldValidate: true});
    const wt = workoutTypes.find(w => w.id === id);
    if (wt) {
      form.setValue('price', wt.default_price, {shouldValidate: true});
      form.setValue('duration_minutes', wt.duration_minutes, {shouldValidate: true});
    }
  };

  const onSubmit = (data: SlotTemplateInput) => {
    startTransition(async () => {
      let result;
      if (templateId) {
        result = await updateSlotTemplateAction(templateId, data);
      } else {
        result = await createSlotTemplateAction(data);
      }

      if (result.success) {
        toast.success(result.message);
        if (!templateId) form.reset();
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || 'Error');
      }
    });
  };

  const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Workout Type */}
        <div className="space-y-2">
          <Label>{dict.workoutType}</Label>
          <Select value={watchWorkoutTypeId || ''} onValueChange={v => v && handleWorkoutTypeChange(v as string)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={dict.selectWorkout}>
                {watchWorkoutTypeId
                  ? (() => {
                      const wt = workoutTypes.find(w => w.id === watchWorkoutTypeId);
                      return wt ? wt.title : undefined;
                    })()
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {workoutTypes.map(wt => (
                <SelectItem key={wt.id} value={wt.id}>
                  {wt.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.workout_type_id && (
            <p className="text-sm text-red-500">{form.formState.errors.workout_type_id.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>{dict.location}</Label>
          <Select
            value={(watchLocation as string) || ''}
            onValueChange={v => v && form.setValue('location', v as ClubLocationType, {shouldValidate: true})}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={dict.selectLocation}>
                {watchLocation ? locationOptions.find(o => o.value === watchLocation)?.label : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map(loc => (
                <SelectItem key={loc.value} value={loc.value}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Day of Week */}
        <div className="space-y-2">
          <Label>{dict.dayOfWeek}</Label>
          <Select
            value={watchDayOfWeek?.toString() || '1'}
            onValueChange={v => v && form.setValue('day_of_week', parseInt(v, 10), {shouldValidate: true})}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={dict.selectDay}>{daysOfWeek[watchDayOfWeek?.toString() || '1']}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {DAY_OF_WEEK_VALUES.map(day => (
                <SelectItem key={day} value={day.toString()}>
                  {daysOfWeek[day.toString()]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <Label>{dict.startTime}</Label>
          <div className="flex items-center gap-2">
            <Select
              value={startHour}
              onValueChange={v => {
                if (!v) return;
                setStartHour(v as string);
                form.setValue('start_time_local', `${v}:${startMinute}`, {shouldValidate: true});
              }}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px]">
                {hours.map(h => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="font-bold">:</span>
            <Select
              value={startMinute}
              onValueChange={v => {
                if (!v) return;
                setStartMinute(v as string);
                form.setValue('start_time_local', `${startHour}:${v}`, {shouldValidate: true});
              }}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px]">
                {minutes.map(m => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>{dict.duration}</Label>
          <Input type="number" min={1} {...form.register('duration_minutes', {valueAsNumber: true})} />
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label>{dict.capacity}</Label>
          <Input type="number" min={1} {...form.register('max_capacity', {valueAsNumber: true})} />
          {form.formState.errors.max_capacity && (
            <p className="text-sm text-red-500">{form.formState.errors.max_capacity.message}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label>{dict.price}</Label>
          <Input type="number" min={0} step="0.01" {...form.register('price', {valueAsNumber: true})} />
        </div>

        {/* Cancellation Deadline */}
        <div className="space-y-2">
          <Label>{dict.cancellationDeadline}</Label>
          <Input type="number" min={0} {...form.register('cancellation_deadline_hours', {valueAsNumber: true})} />
        </div>

        {/* Recurrence Start Date */}
        <div className="space-y-2">
          <Label>{dict.recurrenceStart}</Label>
          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({variant: 'outline'}),
                'w-full justify-start text-left font-normal',
                !recStartDate && 'text-muted-foreground'
              )}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {recStartDate ? formatDate(recStartDate, DATE_FORMATS.DISPLAY_DATE_LONG) : <span>{dict.pickDate}</span>}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={recStartDate}
                onSelect={d => {
                  setRecStartDate(d);
                  if (d) {
                    form.setValue('recurrence_start_date', formatDate(d, DATE_FORMATS.ISO_DATE), {
                      shouldValidate: true
                    });
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Recurrence End Date */}
        <div className="space-y-2">
          <Label>{dict.recurrenceEnd}</Label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="indefinite-checkbox"
              checked={isIndefinite}
              onChange={e => {
                const checked = e.target.checked;
                setIsIndefinite(checked);
                if (checked) {
                  form.setValue('recurrence_end_date', null, {shouldValidate: true});
                } else if (recEndDate) {
                  form.setValue('recurrence_end_date', formatDate(recEndDate, DATE_FORMATS.ISO_DATE), {
                    shouldValidate: true
                  });
                }
              }}
              className="h-4 w-4"
            />
            <label htmlFor="indefinite-checkbox" className="text-sm">
              {dict.indefiniteCheckbox}
            </label>
          </div>
          {!isIndefinite && (
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({variant: 'outline'}),
                  'w-full justify-start text-left font-normal',
                  !recEndDate && 'text-muted-foreground'
                )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {recEndDate ? formatDate(recEndDate, DATE_FORMATS.DISPLAY_DATE_LONG) : <span>{dict.pickDate}</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={recEndDate}
                  onSelect={d => {
                    setRecEndDate(d);
                    if (d && !isIndefinite) {
                      form.setValue('recurrence_end_date', formatDate(d, DATE_FORMATS.ISO_DATE), {
                        shouldValidate: true
                      });
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {templateId
          ? isPending
            ? dict.buttonSaving
            : dict.buttonSave
          : isPending
            ? dict.buttonCreating
            : dict.buttonCreate}
      </Button>
    </form>
  );
}
