'use client';

import React, {useState, useTransition} from 'react';
import {toast} from 'sonner';

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
import {Button} from '@/components/ui/button';
import {cancelBookingAction} from '@/actions/clientBookings';
import {canCancelBooking} from '@/lib/utils/date';
import {useDictionary} from '@/providers/dictionaryProvider';
import type {Database} from '@/types/database.types';
import {BOOKING_STATUS} from '@/constants/bookingStatus';

export interface MyBookingActionProps {
  bookingId: string;
  status: Database['public']['Enums']['booking_status'];
  cancellationDeadlineHours: number;
  startTime: string; // ISO string
}

export function MyBookingAction({bookingId, status, cancellationDeadlineHours, startTime}: MyBookingActionProps) {
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  if (status === BOOKING_STATUS.CANCELLED) {
    return (
      <div className="bg-muted text-muted-foreground w-full rounded-md py-2 text-center text-sm font-medium">
        {dict.dashboardArea.myBookingsPage.badges.cancelled}
      </div>
    );
  }

  const start = new Date(startTime).getTime();
  const now = new Date().getTime();

  if (start <= now) {
    return (
      <div className="bg-primary/10 text-primary w-full rounded-md py-2 text-center text-sm font-medium">
        {dict.dashboardArea.myBookingsPage.badges.completed}
      </div>
    );
  }

  const isPastDeadline = !canCancelBooking(startTime, cancellationDeadlineHours);

  if (isPastDeadline) {
    return (
      <div className="text-muted-foreground w-full py-2 text-center text-sm">
        {dict.dashboardArea.myBookingsPage.cancelUnavailablePrefix}
        {cancellationDeadlineHours}
        {dict.dashboardArea.myBookingsPage.cancelUnavailableSuffix}
      </div>
    );
  }

  const handleCancel = () => {
    startTransition(async () => {
      try {
        const result = await cancelBookingAction(bookingId);
        if (result.success) {
          toast.success(dict.dashboardArea.booking.successCancelled);
          setIsOpen(false);
        } else {
          if (result.code === 'CANCELLATION_NOT_ALLOWED') {
            toast.error(
              `${dict.dashboardArea.booking.errorCancellationNotAllowedPrefix}${cancellationDeadlineHours}${dict.dashboardArea.booking.errorCancellationNotAllowedSuffix}`
            );
          } else {
            toast.error(dict.dashboardArea.booking.errorCancelFailed);
          }
        }
      } catch (err) {
        console.error('Cancel booking error', err);
        toast.error(dict.dashboardArea.booking.errorCancelFailed);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger data-testid="cancel-booking-btn" render={<Button variant="destructive" className="w-full" />}>
        {dict.dashboardArea.myBookingsPage.cancelButton}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="cancel-dialog-title">
            {dict.dashboardArea.myBookingsPage.cancelDialog.title}
          </AlertDialogTitle>
          <AlertDialogDescription data-testid="cancel-dialog-desc">
            {dict.dashboardArea.myBookingsPage.cancelDialog.desc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="cancel-dialog-back-btn" onClick={() => setIsOpen(false)} disabled={isPending}>
            {dict.dashboardArea.myBookingsPage.cancelDialog.back}
          </AlertDialogCancel>
          <AlertDialogAction
            data-testid="cancel-dialog-confirm-btn"
            variant="destructive"
            onClick={e => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isPending}>
            {isPending ? '...' : dict.dashboardArea.myBookingsPage.cancelDialog.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
