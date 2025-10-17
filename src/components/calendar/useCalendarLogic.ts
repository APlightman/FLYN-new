import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { MONTHS, formatDateKey } from '../../utils/dateUtils';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarFilters {
  categories: string[];
  type?: 'income' | 'expense';
  showEmpty: boolean;
}

export function useCalendarLogic() {
  const { state } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CalendarFilters>({
    categories: [],
    showEmpty: true
  });

  const getDateRange = useCallback(() => {
    const date = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        return {
          start: new Date(date.getFullYear(), date.getMonth(), 1),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
        };
      case 'week': {
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const start = new Date(date.setDate(diff));
        return {
          start,
          end: new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
        };
      }
      case 'day':
        return {
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          end: new Date(date.getFullYear(), date.getMonth(), date.getDate())
        };
      default:
        return { start: date, end: date };
    }
  }, [currentDate, viewMode]);

  const periodTransactions = useMemo(() => {
    const { start, end } = getDateRange();
    
    return state.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const isInPeriod = transactionDate >= start && transactionDate <= end;
      
      if (!isInPeriod) return false;
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(transaction.category)) return false;
      
      return true;
    });
  }, [state.transactions, getDateRange, filters]);

  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, typeof periodTransactions> = {};
    
    // Исправляем группировку транзакций по датам
    state.transactions.forEach(transaction => {
      // Используем правильный формат даты
      const dateKey = transaction.date; // Уже в формате YYYY-MM-DD
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });
    
    return grouped;
  }, [state.transactions]);

  const currentDayTransactions = useMemo(() => {
    const dateKey = formatDateKey(currentDate);
    return state.transactions.filter(transaction => {
      if (transaction.date !== dateKey) return false;
      if (filters.type && transaction.type !== filters.type) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(transaction.category)) return false;
      return true;
    });
  }, [state.transactions, currentDate, filters]);

  const navigatePeriod = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      
      switch (viewMode) {
        case 'month':
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'day':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
          break;
      }
      
      return newDate;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setShowTransactionForm(true);
  }, []);

  const periodTitle = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'week': {
        const { start, end } = getDateRange();
        return `${start.getDate()}-${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
      }
      case 'day':
        return `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      default:
        return '';
    }
  }, [currentDate, viewMode, getDateRange]);

  const statsTransactions = viewMode === 'day' ? currentDayTransactions : periodTransactions;
  
  const stats = useMemo(() => {
    const income = statsTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = statsTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [statsTransactions]);

  return {
    currentDate,
    viewMode,
    selectedDate,
    showTransactionForm,
    showFilters,
    filters,
    periodTransactions,
    transactionsByDate,
    currentDayTransactions,
    periodTitle,
    stats,
    setCurrentDate,
    setViewMode,
    setSelectedDate,
    setShowTransactionForm,
    setShowFilters,
    setFilters,
    navigatePeriod,
    goToToday,
    handleDateClick,
    categories: state.categories
  };
}