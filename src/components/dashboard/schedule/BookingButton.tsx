'use client';

import React, {useTransition} from 'react';

import {toast} from 'sonner';

import {useClientDictionary} from '@/lib/i18n/useClientDictionary';

import {bookSlotAction} from '@/actions/clientBookings';

import {Button} from '@/components/ui/button';

interface BookingButtonProps {
  slotId: string;
  isBooked: boolean;
  isFull: boolean;
  isDisabled?: boolean;
}

export function BookingButton({slotId, isBooked, isFull, isDisabled}: BookingButtonProps) {
  const [isPending, startTransition] = useTransition();
  const {dict, locale} = useClientDictionary();

  const handleBook = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('slot_id', slotId);
      formData.append('locale', locale);

      const result = await bookSlotAction({success: false}, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || dict.dashboardArea.booking.errorGeneric);
      }
    });
  };

  if (isBooked) {
    return (
      <Button variant="secondary" disabled className="w-full">
        {dict.dashboardArea.booking.buttonBooked}
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button variant="destructive" disabled className="w-full">
        {dict.dashboardArea.booking.buttonFull}
      </Button>
    );
  }

  return (
    <Button onClick={handleBook} disabled={isPending || isDisabled} className="w-full">
      {isPending ? dict.dashboardArea.booking.buttonBooking : dict.dashboardArea.booking.buttonBookNow}
    </Button>
  );
}
