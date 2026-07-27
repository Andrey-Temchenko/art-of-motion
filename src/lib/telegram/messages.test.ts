import {describe, it, expect, vi, beforeEach} from 'vitest';
import {formatBookingCreatedMessage, formatBookingCancelledMessage} from './messages';

vi.mock('@/lib/utils/locations', () => ({
  getLocationDictKey: vi.fn((location: string) => (location === 'alpha' ? 'alfa' : 'topgun'))
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
        workoutTitle: 'Stretching',
        club: 'alpha',
        startTime: '2026-07-29T15:00:00Z'
      });

      expect(result).toContain('🟢 <b>Новая запись</b>');
      expect(result).toContain('Stretching — alfa');
      expect(result).toContain('29.07.2026 18:00 (Europe/Kyiv)');
      expect(result).toContain('Клиент: Alice (+380501234567)');
    });

    it('should format message without client phone correctly', () => {
      const result = formatBookingCreatedMessage({
        clientName: 'Bob',
        clientPhone: null,
        workoutTitle: 'Hot Iron',
        club: 'top_gun',
        startTime: '2026-07-29T15:00:00Z'
      });

      expect(result).toContain('Клиент: Bob');
      expect(result).not.toContain('()');
    });
  });

  describe('formatBookingCancelledMessage', () => {
    it('should format cancellation message correctly', () => {
      const result = formatBookingCancelledMessage({
        clientName: 'Alice',
        workoutTitle: 'Stretching',
        club: 'alpha',
        startTime: '2026-07-29T15:00:00Z'
      });

      expect(result).toContain('🔴 <b>Отмена записи</b>');
      expect(result).toContain('Stretching — alfa');
      expect(result).toContain('29.07.2026 18:00 (Europe/Kyiv)');
      expect(result).toContain('Клиент: Alice');
    });
  });
});
