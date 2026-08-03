import {describe, it, expect, vi, beforeEach} from 'vitest';

import {BOOKING_STATUS} from '@/constants/bookingStatus';
import {CLUB_LOCATION} from '@/constants/locations';
import {SLOT_STATUS} from '@/constants/slotStatus';

import {bookSlot, getScheduleSlots, cancelBooking, getClientBookings} from './bookingService';
import {DomainError} from './types';

// Mock the date utility to return a stable date for schedule grouping
vi.mock('@/lib/utils/date', () => ({
  getNextWeekRange: vi.fn(() => ({
    startDate: new Date('2026-07-27T00:00:00Z'),
    endDate: new Date('2026-08-02T23:59:59Z')
  }))
}));

describe('bookingService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepos: any;

  beforeEach(() => {
    mockRepos = {
      booking: {
        insertBooking: vi.fn(),
        updateBookingStatus: vi.fn(),
        getClientBookingsList: vi.fn()
      },
      slot: {
        getScheduleSlotsList: vi.fn()
      }
    };
  });

  describe('bookSlot', () => {
    it('should successfully book a slot', async () => {
      mockRepos.booking.insertBooking.mockResolvedValue();
      await expect(bookSlot('slot-1', 'client-1', mockRepos)).resolves.toBeUndefined();
      expect(mockRepos.booking.insertBooking).toHaveBeenCalledWith('slot-1', 'client-1');
    });

    it('should throw DomainError(SLOT_FULL) when DB throws SLOT_FULL message', async () => {
      mockRepos.booking.insertBooking.mockRejectedValue(new Error('SLOT_FULL'));
      await expect(bookSlot('slot-1', 'client-1', mockRepos)).rejects.toThrow(DomainError);
      await expect(bookSlot('slot-1', 'client-1', mockRepos)).rejects.toMatchObject({code: 'SLOT_FULL'});
    });

    it('should throw DomainError(SLOT_FULL) when DB throws P0001 code', async () => {
      const dbError = new Error('Database Error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dbError as any).code = 'P0001';
      mockRepos.booking.insertBooking.mockRejectedValue(dbError);

      await expect(bookSlot('slot-1', 'client-1', mockRepos)).rejects.toMatchObject({code: 'SLOT_FULL'});
    });

    it('should throw DomainError(ALREADY_BOOKED) when DB throws 23505 code', async () => {
      const dbError = new Error('Unique constraint violation');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dbError as any).code = '23505';
      mockRepos.booking.insertBooking.mockRejectedValue(dbError);

      await expect(bookSlot('slot-1', 'client-1', mockRepos)).rejects.toMatchObject({code: 'ALREADY_BOOKED'});
    });

    it('should throw DomainError(DB_ERROR) for any other database error', async () => {
      const dbError = new Error('Some random db failure');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dbError as any).code = '99999';
      mockRepos.booking.insertBooking.mockRejectedValue(dbError);

      await expect(bookSlot('slot-1', 'client-1', mockRepos)).rejects.toMatchObject({code: 'DB_ERROR'});
    });
  });

  describe('getScheduleSlots', () => {
    it('should group and map raw slots correctly, including is_full and is_booked_by_user logic', async () => {
      // Mock some raw data from the repository
      mockRepos.slot.getScheduleSlotsList.mockResolvedValue([
        {
          id: 'slot-1',
          location: CLUB_LOCATION.ALPHA,
          start_time: '2026-07-27T10:00:00Z', // In Kyiv time, this is 13:00 on 2026-07-27
          end_time: '2026-07-27T11:00:00Z',
          max_capacity: 10,
          price: 500,
          status: SLOT_STATUS.SCHEDULED,
          workout_type: {title: 'Yoga'},
          bookings: [{client_id: 'user-1', status: BOOKING_STATUS.CONFIRMED}]
        },
        {
          id: 'slot-2',
          location: CLUB_LOCATION.TOP_GUN,
          start_time: '2026-07-27T12:00:00Z', // Also 2026-07-27 Kyiv time
          end_time: '2026-07-27T13:00:00Z',
          max_capacity: 1, // small capacity
          price: 600,
          status: SLOT_STATUS.SCHEDULED,
          workout_type: [{title: 'Crossfit'}], // handling array case
          bookings: [{client_id: 'user-2', status: BOOKING_STATUS.CONFIRMED}]
        }
      ]);

      const result = await getScheduleSlots('user-1', mockRepos);

      // We expect the slots to be grouped by Kyiv date: '2026-07-27'
      const dateKey = '2026-07-27';
      expect(result).toHaveProperty(dateKey);

      const daySlots = result[dateKey];
      expect(daySlots).toHaveLength(2);

      // Check slot-1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const slot1 = daySlots.find((s: any) => s.id === 'slot-1');
      expect(slot1).toBeDefined();
      expect(slot1?.workout_title_key).toBe('Yoga'); // Extracted from object
      expect(slot1?.bookings_count).toBe(1);
      expect(slot1?.is_full).toBe(false); // 1 < 10
      expect(slot1?.is_booked_by_user).toBe(true); // user-1 is booked

      // Check slot-2
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const slot2 = daySlots.find((s: any) => s.id === 'slot-2');
      expect(slot2).toBeDefined();
      expect(slot2?.workout_title_key).toBe('Crossfit'); // Extracted from array
      expect(slot2?.bookings_count).toBe(1);
      expect(slot2?.is_full).toBe(true); // 1 >= 1 capacity
      expect(slot2?.is_booked_by_user).toBe(false); // booked by user-2, not user-1
    });

    it('should handle null/missing bookings gracefully', async () => {
      mockRepos.slot.getScheduleSlotsList.mockResolvedValue([
        {
          id: 'slot-3',
          start_time: '2026-07-28T10:00:00Z',
          end_time: '2026-07-28T11:00:00Z',
          max_capacity: 5,
          price: 100,
          status: SLOT_STATUS.SCHEDULED,
          workout_type: null,
          bookings: null // Database returns null sometimes for empty arrays via Supabase joins
        }
      ]);

      const result = await getScheduleSlots('user-1', mockRepos);
      const dateKey = '2026-07-28';
      const slot = result[dateKey][0];

      expect(slot.workout_title_key).toBe('');
      expect(slot.bookings_count).toBe(0);
      expect(slot.is_full).toBe(false);
      expect(slot.is_booked_by_user).toBe(false);
    });
  });

  describe('cancelBooking', () => {
    it('should successfully cancel a booking', async () => {
      mockRepos.booking.updateBookingStatus.mockResolvedValue();
      const result = await cancelBooking('b-1', 'u-1', mockRepos);
      expect(result).toEqual({success: true});
      expect(mockRepos.booking.updateBookingStatus).toHaveBeenCalledWith('b-1', 'u-1', BOOKING_STATUS.CANCELLED);
    });

    it('should return CANCELLATION_NOT_ALLOWED for P0002 code', async () => {
      const dbError = new Error('Late cancellation');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dbError as any).code = 'P0002';
      mockRepos.booking.updateBookingStatus.mockRejectedValue(dbError);

      const result = await cancelBooking('b-1', 'u-1', mockRepos);
      expect(result).toEqual({success: false, code: 'CANCELLATION_NOT_ALLOWED'});
    });

    it('should return CANCELLATION_NOT_ALLOWED for message match', async () => {
      mockRepos.booking.updateBookingStatus.mockRejectedValue(new Error('CANCELLATION_NOT_ALLOWED: too late'));

      const result = await cancelBooking('b-1', 'u-1', mockRepos);
      expect(result).toEqual({success: false, code: 'CANCELLATION_NOT_ALLOWED'});
    });

    it('should return UNKNOWN for other errors', async () => {
      mockRepos.booking.updateBookingStatus.mockRejectedValue(new Error('Network disconnected'));

      const result = await cancelBooking('b-1', 'u-1', mockRepos);
      expect(result).toEqual({success: false, code: 'UNKNOWN'});
    });
  });

  describe('getClientBookings', () => {
    it('should sort bookings by start_time and extract slot info', async () => {
      mockRepos.booking.getClientBookingsList.mockResolvedValue([
        {
          id: 'booking-B', // This should be second based on start_time
          status: BOOKING_STATUS.CONFIRMED,
          slots: {
            id: 'slot-2',
            start_time: '2026-07-27T12:00:00Z',
            end_time: '2026-07-27T13:00:00Z',
            location: CLUB_LOCATION.TOP_GUN,
            price: 200,
            cancellation_deadline_hours: 24,
            workout_types: [{title: 'TRX'}]
          }
        },
        {
          id: 'booking-A', // This should be first
          status: BOOKING_STATUS.CANCELLED,
          slots: [
            {
              id: 'slot-1',
              start_time: '2026-07-27T10:00:00Z',
              end_time: '2026-07-27T11:00:00Z',
              location: CLUB_LOCATION.ALPHA,
              price: 100,
              cancellation_deadline_hours: 12,
              workout_types: {title: 'Pilates'}
            }
          ]
        }
      ]);

      const result = await getClientBookings('user-1', mockRepos);

      expect(result).toHaveLength(2);
      // Check sorting
      expect(result[0].id).toBe('booking-A'); // 10:00
      expect(result[1].id).toBe('booking-B'); // 12:00

      // Check extracted fields for A
      expect(result[0].status).toBe(BOOKING_STATUS.CANCELLED);
      expect(result[0].slot.workout_title_key).toBe('Pilates');
      expect(result[0].slot.cancellation_deadline_hours).toBe(12);

      // Check extracted fields for B
      expect(result[1].slot.workout_title_key).toBe('TRX');
    });

    it('should handle missing slots gracefully', async () => {
      mockRepos.booking.getClientBookingsList.mockResolvedValue([
        {
          id: 'booking-C',
          status: BOOKING_STATUS.CONFIRMED,
          slots: null // Missing slot data
        }
      ]);

      const result = await getClientBookings('user-1', mockRepos);

      expect(result[0].slot.id).toBe('');
      expect(result[0].slot.price).toBe(0);
      expect(result[0].slot.workout_title_key).toBe('');
    });
  });
});
