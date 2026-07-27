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
import {cancelBookingAction} from '@/actions/adminSlots';

interface CancelBookingButtonProps {
  bookingId: string;
  dict: {
    buttonText: string;
    dialogTitle: string;
    dialogDesc: string;
    dialogBack: string;
    dialogConfirm: string;
  };
}

export function CancelBookingButton({bookingId, dict}: CancelBookingButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleCancel = () => {
    startTransition(async () => {
      try {
        const result = await cancelBookingAction(bookingId);
        if (result.success) {
          toast.success(result.message || 'Cancelled successfully');
          setIsOpen(false);
        } else {
          toast.error(result.message || 'Failed to cancel booking');
        }
      } catch (err) {
        console.error('Cancel booking error', err);
        toast.error('An unexpected error occurred.');
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>{dict.buttonText}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dict.dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dict.dialogDesc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsOpen(false)} disabled={isPending}>
            {dict.dialogBack}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={e => {
              e.preventDefault();
              handleCancel();
            }}>
            {isPending ? '...' : dict.dialogConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
