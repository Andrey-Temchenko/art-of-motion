import {describe, it, expect, vi, beforeEach} from 'vitest';
import {formatBookingCreatedMessage, formatBookingCancelledMessage} from './messages';
import {CLUB_LOCATION} from '@/constants/locations';

vi.mock('@/lib/utils/locations', () => ({
  getLocationDictKey: vi.fn((location: string) => (location === CLUB_LOCATION.ALPHA ? 'alfa' : 'topgun'))
}));

vi.mock('@/lib/utils/timezone', () => ({
  formatKyivTime: vi.fn(() => '29.07.2026 18:00')
}));

describe('Telegram Messages Formatter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatBookingCreatedMessage', () => {
    it('should format message with client phone correctly', () => {
      const result = formatBookingCreatedMessage({
        clientName: 'Alice',
        clientPhone: '+380501234567',
        workoutTitle: 'stretching',
        club: CLUB_LOCATION.ALPHA,
        startTime: '2026-07-29T15:00:00Z'
      });

      expect(result).toContain('🟢 <b>Новая запись</b>');
      expect(result).toContain('<b>Растяжка</b>');
      expect(result).toContain('📍 ALFA Elit Fitness');
      expect(result).toContain('📅 29.07.2026 18:00');
      expect(result).toContain('👤 Alice (+380501234567)');
      expect(result).not.toContain('(Europe/Kyiv)');
    });

    it('should format message without client phone correctly', () => {
      const result = formatBookingCreatedMessage({
        clientName: 'Bob',
        clientPhone: null,
        workoutTitle: 'hotIron',
        club: CLUB_LOCATION.TOP_GUN,
        startTime: '2026-07-29T15:00:00Z'
      });

      expect(result).toContain('👤 Bob');
      expect(result).not.toContain('()');
    });
  });

  describe('formatBookingCancelledMessage', () => {
    it('should format cancellation message correctly', () => {
      const result = formatBookingCancelledMessage({
        clientName: 'Alice',
        workoutTitle: 'stretching',
        club: CLUB_LOCATION.ALPHA,
        startTime: '2026-07-29T15:00:00Z'
      });

      expect(result).toContain('🔴 <b>Отмена записи</b>');
      expect(result).toContain('<b>Растяжка</b>');
      expect(result).toContain('📍 ALFA Elit Fitness');
      expect(result).toContain('📅 29.07.2026 18:00');
      expect(result).toContain('👤 Alice');
      expect(result).not.toContain('(Europe/Kyiv)');
    });
  });
});
