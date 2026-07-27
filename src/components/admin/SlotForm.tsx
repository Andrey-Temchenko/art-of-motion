'use client';

import React, {useState, useEffect, useCallback, useTransition} from 'react';
import {useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {toast} from 'sonner';
import {format, addMinutes} from 'date-fns';
import {CalendarIcon} from 'lucide-react';

import {createSlotSchema, CreateSlotInput} from '@/lib/validators/slots';
import {createSlotAction} from '@/actions/adminSlots';
import {ProcessedAdminSlot} from '@/services/types';
import {cn} from '@/lib/utils';
import {Database} from '@/types/database.types';
import {CLUB_LOCATION_VALUES} from '@/constants/locations';
import {SLOT_STATUS} from '@/constants/slotStatus';

import {Button, buttonVariants} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';

export type WorkoutType = {
  id: string;
  title: string;
  duration_minutes: number;
  default_price: number;
};

interface SlotFormProps {
  workoutTypes: WorkoutType[];
  locationOptions: {value: string; label: string}[];
  existingSlots: ProcessedAdminSlot[];
  dict: Record<string, string>;
}

export function SlotForm({
  workoutTypes,
  locationOptions,
  existingSlots,
  dict,
  onSuccess
}: SlotFormProps & {onSuccess?: () => void}) {
  const [isPending, startTransition] = useTransition();

  const STATUS_CANCELLED = SLOT_STATUS.CANCELLED;

  const defaultLocation = locationOptions[0]?.value || CLUB_LOCATION_VALUES[0];

  const form = useForm<CreateSlotInput>({
    resolver: zodResolver(createSlotSchema),
    defaultValues: {
      workout_type_id: '',
      location: defaultLocation as Database['public']['Enums']['club_location'],
      max_capacity: 1,
      price: 0,
      start_time: '',
      end_time: ''
    }
  });

  const watchWorkoutTypeId = useWatch({control: form.control, name: 'workout_type_id'});
  const watchLocation = useWatch({control: form.control, name: 'location'});

  // Derived state for DatePicker + Time fields
  const [date, setDate] = useState<Date>();
  const [startHour, setStartHour] = useState('18');
  const [startMinute, setStartMinute] = useState('00');
  const [duration, setDuration] = useState<number>(60);

  // When workout type changes, we pre-fill price and end time (based on duration)
  const handleWorkoutTypeChange = (id: string) => {
    form.setValue('workout_type_id', id, {shouldValidate: true});
    const wt = workoutTypes.find(w => w.id === id);
    if (wt) {
      form.setValue('price', wt.default_price, {shouldValidate: true});
      setDuration(wt.duration_minutes);
    }
  };

  const updateStartAndEndTimes = useCallback(
    (selectedDate: Date | undefined, hour: string, minute: string, durationMins: number) => {
      if (!selectedDate) return;

      // Create timezone-agnostic strings (e.g. 2026-07-29T18:00:00) to ensure the
      // server correctly interprets it as Kyiv time instead of browser's local time.
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startStr = `${dateStr}T${hour}:${minute}:00`;

      // For end time calculation, we can use a local Date to add minutes safely
      const startObj = new Date(selectedDate);
      startObj.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
      const endObj = addMinutes(startObj, durationMins);

      const endStr = `${format(endObj, 'yyyy-MM-dd')}T${format(endObj, 'HH:mm')}:00`;

      form.setValue('start_time', startStr, {shouldValidate: true});
      form.setValue('end_time', endStr, {shouldValidate: true});
    },
    [form]
  );

  useEffect(() => {
    updateStartAndEndTimes(date, startHour, startMinute, duration);
  }, [date, startHour, startMinute, duration, updateStartAndEndTimes]);

  const onSubmit = (data: CreateSlotInput) => {
    // Validate overlap client-side
    const newStart = new Date(data.start_time).getTime();
    const newEnd = new Date(data.end_time).getTime();

    const isOverlap = existingSlots.some(slot => {
      if (slot.status === STATUS_CANCELLED) return false;

      const slotStart = new Date(slot.start_time).getTime();
      const slotEnd = new Date(slot.end_time).getTime();

      return newStart < slotEnd && newEnd > slotStart;
    });

    if (isOverlap) {
      toast.error(dict.overlapError || 'Trainer is already busy at this time!');
      return;
    }

    startTransition(async () => {
      // Need FormData to match the server action signature
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const result = await createSlotAction({success: false}, formData);
      if (result.success) {
        toast.success(result.message);
        form.reset();
        setDate(undefined);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || 'Error creating slot');
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
            value={watchLocation || ''}
            onValueChange={v =>
              v && form.setValue('location', v as Database['public']['Enums']['club_location'], {shouldValidate: true})
            }>
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
          {form.formState.errors.location && (
            <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
          )}
        </div>

        {/* Date and Time Picker */}
        <div className="space-y-2">
          <Label>{dict.dateTime}</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Popover>
              <PopoverTrigger
                className={cn(
                  buttonVariants({variant: 'outline'}),
                  'w-full justify-start text-left font-normal sm:w-auto sm:flex-1',
                  !date && 'text-muted-foreground'
                )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>{dict.pickDate}</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2">
              <Select value={startHour} onValueChange={v => v && setStartHour(v as string)}>
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
              <Select value={startMinute} onValueChange={v => v && setStartMinute(v as string)}>
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
          {form.formState.errors.start_time && <p className="text-sm text-red-500">Please pick a valid date</p>}
        </div>
        {/* Duration */}
        <div className="space-y-2">
          <Label>{dict.duration}</Label>
          <Input type="number" min={1} value={duration} onChange={e => setDuration(parseInt(e.target.value) || 60)} />
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
          {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? dict.buttonCreating : dict.buttonCreate}
      </Button>
    </form>
  );
}
