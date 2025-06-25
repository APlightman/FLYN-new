import React from 'react';
import { Modal } from '../ui/Modal';
import { TransactionForm } from '../transactions/TransactionForm';
import { CalendarHeader } from './CalendarHeader';
import { CalendarStats } from './CalendarStats';
import { CalendarContent } from './CalendarContent';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarFilters } from './CalendarFilters';
import { useCalendarLogic } from './useCalendarLogic';

export function Calendar() {
  const {
    // State
    currentDate,
    viewMode,
    selectedDate,
    showTransactionForm,
    showFilters,
    filters,
    
    // Computed
    periodTransactions,
    transactionsByDate,
    currentDayTransactions,
    periodTitle,
    stats,
    
    // Actions
    setViewMode,
    setShowTransactionForm,
    setShowFilters,
    setFilters,
    navigatePeriod,
    goToToday,
    handleDateClick,
    setCurrentDate,
    setSelectedDate,
    
    // Data
    categories
  } = useCalendarLogic();

  const transactionCount = viewMode === 'day' ? currentDayTransactions.length : periodTransactions.length;

  return (
    <div className="space-y-6">
      {/* Заголовок и навигация */}
      <CalendarHeader
        transactionCount={transactionCount}
        onShowFilters={() => setShowFilters(true)}
        onShowTransactionForm={() => setShowTransactionForm(true)}
      />

      {/* Статистика периода */}
      <CalendarStats
        stats={stats}
        transactionCount={transactionCount}
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Основной календарь */}
        <div className="xl:col-span-3">
          <CalendarContent
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            currentDate={currentDate}
            periodTitle={periodTitle}
            onNavigatePeriod={navigatePeriod}
            onGoToToday={goToToday}
            transactionsByDate={transactionsByDate}
            currentDayTransactions={currentDayTransactions}
            onDateClick={handleDateClick}
            categories={categories}
            showEmpty={filters.showEmpty}
          />
        </div>

        {/* Боковая панель */}
        <div className="xl:col-span-1">
          <CalendarSidebar
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            transactionsByDate={transactionsByDate}
            categories={categories}
          />
        </div>
      </div>

      {/* Модальные окна */}
      <Modal
        isOpen={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false);
          setSelectedDate(null);
        }}
        title="Добавить транзакцию"
      >
        <TransactionForm
          initialData={selectedDate ? {
            id: '',
            type: 'expense',
            amount: 0,
            category: '',
            description: '',
            date: selectedDate.toISOString().split('T')[0],
            tags: []
          } : undefined}
          onSuccess={() => {
            setShowTransactionForm(false);
            setSelectedDate(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Фильтры календаря"
      >
        <CalendarFilters
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
          onClose={() => setShowFilters(false)}
        />
      </Modal>
    </div>
  );
}