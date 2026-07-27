export const CLUB_LOCATION = {
  ALPHA: 'alpha',
  TOP_GUN: 'top_gun'
} as const;

export type ClubLocationType = (typeof CLUB_LOCATION)[keyof typeof CLUB_LOCATION];

export const CLUB_LOCATION_VALUES = Object.values(CLUB_LOCATION) as [ClubLocationType, ...ClubLocationType[]];
