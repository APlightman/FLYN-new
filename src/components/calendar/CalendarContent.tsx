import React from 'react';
import { CalendarDay } from './CalendarDay';
import { CalendarWeek } from './CalendarWeek';
import { CalendarMonth } from './CalendarMonth';
import { CalendarControls } from './CalendarControls';
import { Card } from '../ui/Card';
import { Transaction, Category } from '../../types';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarContentProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentDate: Date;
  periodTitle: string;
  onNavigatePeriod: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  transactionsByDate: Record<string, Transaction[]>;
  currentDayTransactions: Transaction[];
  onDateClick: (date: Date) => void;
  categories: Category[];
  showEmpty: boolean;
}

export function CalendarContent({
  viewMode,
  onViewModeChange,
  currentDate,
  periodTitle,
  onNavigatePeriod,
  onGoToToday,
  transactionsByDate,
  currentDayTransactions,
  onDateClick,
  categories,
  showEmpty
}: CalendarContentProps) {
  return (
    <Card variant="elevated">
      <CalendarControls
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        periodTitle={periodTitle}
        onNavigatePeriod={onNavigatePeriod}
        onGoToToday={onGoToToday}
      />

      {/* Отображение календаря в зависимости от режима */}
      {viewMode === 'month' && (
        <CalendarMonth
          currentDate={currentDate}
          transactionsByDate={transactionsByDate}
          onDateClick={onDateClick}
          categories={categories}
          showEmpty={showEmpty}
        />
      )}

      {viewMode === 'week' && (
        <CalendarWeek
          currentDate={currentDate}
          transactionsByDate={transactionsByDate}
          onDateClick={onDateClick}
          categories={categories}
        />
      )}

      {viewMode === 'day' && (
        <CalendarDay
          currentDate={currentDate}
          transactions={currentDayTransactions}
          categories={categories}
        />
      )}
    </Card>
  );
}
