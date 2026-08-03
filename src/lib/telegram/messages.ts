import {getLocationDictKey} from '@/lib/utils/locations';
import {formatKyivTime} from '@/lib/utils/timezone';

const WORKOUT_TITLES_RU: Record<string, string> = {
  strength: 'Силовая',
  stretching: 'Растяжка',
  mfr: 'МФР',
  balance_board: 'Балансборд',
  trx: 'TRX',
  gym: 'Тренажерный зал',
  hotIron: 'Хот айрон'
};

const CLUBS_RU: Record<string, string> = {
  alfa: 'ALFA Elit Fitness',
  topgun: 'TOP GUN Fitness Club'
};

function getWorkoutTitleRu(title: string): string {
  return WORKOUT_TITLES_RU[title] || title;
}

function getClubNameRu(club: string): string {
  const dictKey = getLocationDictKey(club);
  return CLUBS_RU[dictKey] || dictKey;
}

export function formatBookingCreatedMessage(params: {
  clientName: string;
  clientPhone: string | null;
  workoutTitle: string;
  club: string;
  startTime: string; // ISO string from DB
}): string {
  const dateStr = formatKyivTime(params.startTime, 'dd.MM.yyyy HH:mm');
  const workoutTitle = getWorkoutTitleRu(params.workoutTitle);
  const clubName = getClubNameRu(params.club);

  return [
    '🟢 <b>Новая запись</b>',
    '',
    `<b>${workoutTitle}</b>`,
    '',
    `📅 ${dateStr}`,
    `📍 ${clubName}`,
    '',
    `👤 ${params.clientName}${params.clientPhone ? ` (${params.clientPhone})` : ''}`
  ].join('\n');
}

export function formatBookingCancelledMessage(params: {
  clientName: string;
  workoutTitle: string;
  club: string;
  startTime: string; // ISO string from DB
}): string {
  const dateStr = formatKyivTime(params.startTime, 'dd.MM.yyyy HH:mm');
  const workoutTitle = getWorkoutTitleRu(params.workoutTitle);
  const clubName = getClubNameRu(params.club);

  return [
    '🔴 <b>Отмена записи</b>',
    '',
    `<b>${workoutTitle}</b>`,
    '',
    `📅 ${dateStr}`,
    `📍 ${clubName}`,
    '',
    `👤 ${params.clientName}`
  ].join('\n');
}
