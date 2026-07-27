import {formatKyivTime} from '@/lib/utils/timezone';
import {getLocationDictKey} from '@/lib/utils/locations';

export function formatBookingCreatedMessage(params: {
  clientName: string;
  clientPhone: string | null;
  workoutTitle: string;
  club: string;
  startTime: string; // ISO string from DB
}): string {
  const dateStr = formatKyivTime(params.startTime, 'dd.MM.yyyy HH:mm');

  return [
    '🟢 <b>Новая запись</b>',
    `${params.workoutTitle} — ${getLocationDictKey(params.club)}`,
    `${dateStr} (Europe/Kyiv)`,
    `Клиент: ${params.clientName}${params.clientPhone ? ` (${params.clientPhone})` : ''}`
  ].join('\n');
}

export function formatBookingCancelledMessage(params: {
  clientName: string;
  workoutTitle: string;
  club: string;
  startTime: string; // ISO string from DB
}): string {
  const dateStr = formatKyivTime(params.startTime, 'dd.MM.yyyy HH:mm');

  return [
    '🔴 <b>Отмена записи</b>',
    `${params.workoutTitle} — ${getLocationDictKey(params.club)}`,
    `${dateStr} (Europe/Kyiv)`,
    `Клиент: ${params.clientName}`
  ].join('\n');
}
