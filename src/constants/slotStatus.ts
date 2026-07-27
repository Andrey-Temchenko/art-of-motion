export const SLOT_STATUS = {
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

export type SlotStatusType = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];

export const SLOT_STATUS_VALUES = Object.values(SLOT_STATUS) as [SlotStatusType, ...SlotStatusType[]];
