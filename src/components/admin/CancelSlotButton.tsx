'use client';

import React, {useState, useTransition} from 'react';
import {toast} from 'sonner';
import {TrashIcon} from 'lucide-react';

import {cancelSlotAction} from '@/actions/adminSlots';
import {useDictionary} from '@/providers/dictionaryProvider';

import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface CancelSlotButtonProps {
  slotId: string;
}

export function CancelSlotButton({slotId}: CancelSlotButtonProps) {
  const dictionary = useDictionary();
  const dict = dictionary.admin.slotDetailsPage;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelSlotAction(slotId);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        // After cancelling, it's good to redirect back to slots page or just refresh.
        // It's already revalidated in the action, but a client-side navigation might be nice.
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" data-testid="cancel-slot-btn" />}>
        <TrashIcon className="mr-2 h-4 w-4" />
        {dict.cancelSlotBtn}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle data-testid="cancel-dialog-title">{dict.cancelSlotDialog.title}</DialogTitle>
          <DialogDescription>{dict.cancelSlotDialog.desc}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            data-testid="cancel-dialog-back-btn">
            {dict.cancelSlotDialog.back}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
            data-testid="cancel-dialog-confirm-btn">
            {isPending ? '...' : dict.cancelSlotDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
