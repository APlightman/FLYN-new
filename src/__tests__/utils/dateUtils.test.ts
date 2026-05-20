import { describe, it, expect } from 'vitest';
import { 
  isToday, 
  isSameMonth, 
  getDaysInMonth, 
  formatDateKey, 
  parseDateKey,
  MONTHS,
  WEEKDAYS
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  describe('MONTHS', () => {
    it('contains 12 months in Russian', () => {
      expect(MONTHS).toHaveLength(12);
      expect(MONTHS[0]).toBe('Январь');
      expect(MONTHS[11]).toBe('Декабрь');
    });
  });

  describe('WEEKDAYS', () => {
    it('contains 7 weekdays in Russian', () => {
      expect(WEEKDAYS).toHaveLength(7);
      expect(WEEKDAYS[0]).toBe('Пн');
      expect(WEEKDAYS[6]).toBe('Вс');
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isSameMonth', () => {
    it('returns true for dates in same month', () => {
      const date1 = new Date(2024, 5, 1);
      const date2 = new Date(2024, 5, 15);
      expect(isSameMonth(date1, date2)).toBe(true);
    });

    it('returns false for dates in different months', () => {
      const date1 = new Date(2024, 5, 1);
      const date2 = new Date(2024, 6, 1);
      expect(isSameMonth(date1, date2)).toBe(false);
    });

    it('returns false for dates in same month but different years', () => {
      const date1 = new Date(2023, 5, 1);
      const date2 = new Date(2024, 5, 1);
      expect(isSameMonth(date1, date2)).toBe(false);
    });
  });

  describe('getDaysInMonth', () => {
    it('returns 42 days for any month (6 weeks grid)', () => {
      const date = new Date(2024, 5, 15);
      const days = getDaysInMonth(date);
      expect(days).toHaveLength(42);
    });

    it('includes days from previous month', () => {
      const date = new Date(2024, 5, 1); // June
      const days = getDaysInMonth(date);
      const firstDay = days[0];
      expect(firstDay?.getMonth()).toBe(4); // May
    });

    it('includes days from next month', () => {
      const date = new Date(2024, 5, 15); // June
      const days = getDaysInMonth(date);
      const lastDay = days[days.length - 1];
      expect(lastDay?.getMonth()).toBe(6); // July
    });

    it('includes all days of current month', () => {
      const date = new Date(2024, 1, 15); // February 2024 (leap year)
      const days = getDaysInMonth(date);
      const currentMonthDays = days.filter(d => d && d.getMonth() === 1);
      expect(currentMonthDays).toHaveLength(29);
    });

    it('returns correct number of days for January', () => {
      const date = new Date(2024, 0, 15); // January
      const days = getDaysInMonth(date);
      const currentMonthDays = days.filter(d => d && d.getMonth() === 0);
      expect(currentMonthDays).toHaveLength(31);
    });
  });

  describe('formatDateKey', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2024, 5, 15);
      expect(formatDateKey(date)).toBe('2024-06-15');
    });

    it('pads single digit months with zero', () => {
      const date = new Date(2024, 0, 15); // January
      expect(formatDateKey(date)).toBe('2024-01-15');
    });

    it('pads single digit days with zero', () => {
      const date = new Date(2024, 5, 5);
      expect(formatDateKey(date)).toBe('2024-06-05');
    });

    it('handles leap year dates', () => {
      const date = new Date(2024, 1, 29); // February 29, 2024
      expect(formatDateKey(date)).toBe('2024-02-29');
    });
  });

  describe('parseDateKey', () => {
    it('parses YYYY-MM-DD format correctly', () => {
      const dateKey = '2024-06-15';
      const date = parseDateKey(dateKey);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(date.getDate()).toBe(15);
    });

    it('parses dates with leading zeros', () => {
      const dateKey = '2024-01-05';
      const date = parseDateKey(dateKey);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(5);
    });

    it('round-trips with formatDateKey', () => {
      const originalDate = new Date(2024, 5, 15);
      const dateKey = formatDateKey(originalDate);
      const parsedDate = parseDateKey(dateKey);
      expect(parsedDate.toDateString()).toBe(originalDate.toDateString());
    });
  });
});
