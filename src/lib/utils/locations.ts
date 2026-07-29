import type {Dictionary} from '@/lib/i18n/types';

const LOCATION_TO_DICT_KEY = {
  alpha: 'alfa',
  top_gun: 'topgun'
} as const;

export type ClubDictKey = (typeof LOCATION_TO_DICT_KEY)[keyof typeof LOCATION_TO_DICT_KEY];

export function getLocationDictKey(location: string): string {
  return (LOCATION_TO_DICT_KEY as Record<string, string>)[location] || location;
}

/**
 * Safely extracts a club's localized name from the dictionary.
 * Returns the raw location string as a fallback if the key is not found.
 */
export function getLocationLabel(dict: Dictionary, location: string): string {
  const dictKey = getLocationDictKey(location);
  const clubs = dict.contact.clubs as Record<string, {name?: string; address?: string}> | undefined;
  return clubs?.[dictKey]?.name || location;
}
