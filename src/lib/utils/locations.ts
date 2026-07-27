export function getLocationDictKey(location: string): string {
  const locationToDictKey: Record<string, string> = {
    alpha: 'alfa',
    top_gun: 'topgun'
  };

  return locationToDictKey[location] || location;
}
