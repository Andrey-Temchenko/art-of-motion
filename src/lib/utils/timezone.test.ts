import {describe, it, expect} from 'vitest';

import {fromKyivTime, formatKyivTime} from './timezone';

describe('Timezone utilities', () => {
  it('converts Kyiv local string to UTC Date correctly', () => {
    // July is summer time (EEST) in Kyiv -> UTC+3
    const localInput = '2026-07-29T18:00:00';
    const utcDate = fromKyivTime(localInput);

    // In UTC, it should be 15:00:00
    expect(utcDate.getUTCHours()).toBe(15);
    expect(utcDate.toISOString()).toBe('2026-07-29T15:00:00.000Z');
  });

  it('converts UTC Date to Kyiv Date correctly', () => {
    // 15:00 UTC -> 18:00 Kyiv (in July)
    const utcInput = new Date('2026-07-29T15:00:00.000Z');

    const formatted = formatKyivTime(utcInput, 'yyyy-MM-dd HH:mm');
    expect(formatted).toBe('2026-07-29 18:00');
  });

  it('formats dates in Kyiv timezone correctly', () => {
    // Winter time (EET) in Kyiv -> UTC+2
    const utcWinterInput = new Date('2026-01-15T15:00:00.000Z');
    const formatted = formatKyivTime(utcWinterInput, 'HH:mm');
    // 15:00 + 2 hours = 17:00
    expect(formatted).toBe('17:00');
  });
});
