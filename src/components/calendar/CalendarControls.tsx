import React from 'react';
import { ChevronLeft, ChevronRight, Grid, List, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/Button';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  periodTitle: string;
  onNavigatePeriod: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
}

export function CalendarControls({
  viewMode,
  onViewModeChange,
  periodTitle,
  onNavigatePeriod,
  onGoToToday
}: CalendarControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigatePeriod('prev')}
            className="rounded-xl"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 min-w-[200px] text-center">
            {periodTitle}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigatePeriod('next')}
            className="rounded-xl"
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onGoToToday}
        >
          Сегодня
        </Button>
      </div>

      {/* Переключатель режимов */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
        <button
          onClick={() => onViewModeChange('month')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            viewMode === 'month'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Grid size={16} className="inline mr-2" />
          Месяц
        </button>
        <button
          onClick={() => onViewModeChange('week')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            viewMode === 'week'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <List size={16} className="inline mr-2" />
          Неделя
        </button>
        <button
          onClick={() => onViewModeChange('day')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            viewMode === 'day'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <CalendarIcon size={16} className="inline mr-2" />
          День
        </button>
      </div>
    </div>
  );
}
