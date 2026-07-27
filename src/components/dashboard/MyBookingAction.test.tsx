import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MyBookingAction} from './MyBookingAction';
import {BOOKING_STATUS} from '@/constants/bookingStatus';
import type {Dictionary} from '@/lib/i18n/types';

// Mock dependencies
vi.mock('@/actions/clientBookings', () => ({
  cancelBookingAction: vi.fn().mockResolvedValue({success: true})
}));
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockDict = {
  dashboardArea: {
    myBookingsPage: {
      cancelButton: 'Отменить бронь',
      badges: {
        completed: 'Завершено',
        cancelled: 'Отменено'
      },
      cancelDialog: {
        title: 'Отменить бронь?',
        description: 'Вы уверены?',
        back: 'Назад',
        confirm: 'Отменить'
      },
      toast: {
        cancelSuccess: 'Бронь отменена',
        cancelError: 'Ошибка',
        cancelNotAllowed: 'Нельзя отменить'
      }
    }
  }
} as unknown as Dictionary;

describe('MyBookingAction', () => {
  it('renders cancelled badge if status is cancelled', () => {
    render(
      <MyBookingAction
        bookingId="1"
        status={BOOKING_STATUS.CANCELLED}
        cancellationDeadlineHours={24}
        startTime={new Date(Date.now() + 86400000).toISOString()} // Future
        dict={mockDict}
      />
    );
    expect(screen.getByText('Отменено')).toBeInTheDocument();
  });

  it('renders completed badge if start time is in the past', () => {
    render(
      <MyBookingAction
        bookingId="1"
        status={BOOKING_STATUS.CONFIRMED}
        cancellationDeadlineHours={24}
        startTime={new Date(Date.now() - 3600000).toISOString()} // Past
        dict={mockDict}
      />
    );
    expect(screen.getByText('Завершено')).toBeInTheDocument();
  });

  it('renders cancel button if booking is upcoming', () => {
    render(
      <MyBookingAction
        bookingId="1"
        status={BOOKING_STATUS.CONFIRMED}
        cancellationDeadlineHours={24}
        startTime={new Date(Date.now() + 86400000 * 2).toISOString()} // Future (48h)
        dict={mockDict}
      />
    );
    expect(screen.getByText('Отменить бронь')).toBeInTheDocument();
  });
});
