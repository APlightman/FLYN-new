import React, { useState, useMemo, useCallback } from 'react';
import { Edit, Trash2, Search, Filter, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Transaction } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { TransactionForm } from './TransactionForm';
import { TransactionFilters } from './TransactionFilters';
import { Modal } from '../ui/Modal';

interface QuickFilterState {
  type?: 'income' | 'expense';
  categories: string[];
  dateRange: {
    start: string;
    end: string;
  };
  amountRange: {
    min?: number;
    max?: number;
  };
  searchTerm: string;
  quickDate?: 'today' | 'week' | 'month' | 'year';
}

export function TransactionList() {
  const { state, deleteTransaction } = useApp();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [quickFilters, setQuickFilters] = useState<QuickFilterState>({
    categories: [],
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    amountRange: {},
    searchTerm: '',
  });

  // Мемоизированная функция фильтрации
  const filterTransaction = useCallback((transaction: Transaction, filters: QuickFilterState): boolean => {
    // Фильтр по типу
    if (filters.type && transaction.type !== filters.type) {
      return false;
    }

    // Фильтр по категориям
    if (filters.categories.length > 0 && !filters.categories.includes(transaction.category)) {
      return false;
    }

    // Фильтр по диапазону дат
    const transactionDate = new Date(transaction.date);
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    if (transactionDate < startDate || transactionDate > endDate) {
      return false;
    }

    // Фильтр по сумме
    if (filters.amountRange.min !== undefined && transaction.amount < filters.amountRange.min) {
      return false;
    }
    
    if (filters.amountRange.max !== undefined && transaction.amount > filters.amountRange.max) {
      return false;
    }

    // Поиск по тексту
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const searchableText = [
        transaction.description,
        transaction.category,
        ...(transaction.tags || [])
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  }, []);

  // Мемоизированные отфильтрованные транзакции
  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter(transaction => filterTransaction(transaction, quickFilters))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, quickFilters, filterTransaction]);

  // Мемоизированная статистика
  const transactionStats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Мемоизированная карта цветов категорий
  const categoryColorMap = useMemo(() => {
    return state.categories.reduce((map, category) => {
      map[category.name] = category.color;
      return map;
    }, {} as Record<string, string>);
  }, [state.categories]);

  // Мемоизированная функция очистки фильтров
  const clearFilters = useCallback(() => {
    setQuickFilters({
      categories: [],
      dateRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      amountRange: {},
      searchTerm: '',
    });
  }, []);

  // Мемоизированная функция форматирования валюты
  const formatAmount = useCallback((amount: number, type: 'income' | 'expense') => {
    const formatted = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  }, []);

  // Мемоизированная функция получения цвета категории
  const getCategoryColor = useCallback((categoryName: string) => {
    return categoryColorMap[categoryName] || '#6b7280';
  }, [categoryColorMap]);

  // Мемоизированный счетчик активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (quickFilters.type) count++;
    if (quickFilters.categories.length > 0) count++;
    if (quickFilters.searchTerm) count++;
    if (quickFilters.amountRange.min || quickFilters.amountRange.max) count++;
    if (quickFilters.quickDate) count++;
    return count;
  }, [quickFilters]);

  // Мемоизированные обработчики событий
  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    deleteTransaction(id);
  }, [deleteTransaction]);

  const handleShowForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditingTransaction(null);
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // Мемоизированный компонент транзакции
  const TransactionItem = React.memo(({ transaction }: { transaction: Transaction }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getCategoryColor(transaction.category) }}
        />
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {transaction.description}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{transaction.category}</span>
            <span>•</span>
            <span>{new Date(transaction.date).toLocaleDateString('ru-RU')}</span>
            {transaction.tags && transaction.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex gap-1">
                  {transaction.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {transaction.tags.length > 2 && (
                    <span className="text-xs text-slate-400">
                      +{transaction.tags.length - 2}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`font-semibold ${
          transaction.type === 'income' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {formatAmount(transaction.amount, transaction.type)}
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditTransaction(transaction)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteTransaction(transaction.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  ));

  // Мемоизированная статистика
  const StatsSection = React.memo(() => (
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-slate-500 dark:text-slate-400">Доходы</div>
          <div className="font-semibold text-green-600 dark:text-green-400">
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
            }).format(transactionStats.income)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-slate-500 dark:text-slate-400">Расходы</div>
          <div className="font-semibold text-red-600 dark:text-red-400">
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
            }).format(transactionStats.expenses)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-slate-500 dark:text-slate-400">Баланс</div>
          <div className="font-semibold text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
            }).format(transactionStats.balance)}
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Транзакции
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Показано: {transactionStats.count} из {state.transactions.length} транзакций
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleToggleFilters}
          >
            <Filter size={16} />
            Фильтры {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          <Button onClick={handleShowForm}>
            <Plus size={16} />
            Добавить транзакцию
          </Button>
        </div>
      </div>

      {/* Быстрые фильтры */}
      {showFilters && (
        <TransactionFilters
          filters={quickFilters}
          onFiltersChange={setQuickFilters}
          categories={state.categories}
          onClearFilters={clearFilters}
        />
      )}

      {/* Список транзакций */}
      <Card>
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Транзакции не найдены
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {activeFiltersCount > 0 
                  ? 'Попробуйте изменить параметры фильтрации'
                  : 'Создайте свою первую транзакцию'
                }
              </p>
              {activeFiltersCount > 0 ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Очистить фильтры
                </Button>
              ) : (
                <Button onClick={handleShowForm}>
                  Добавить транзакцию
                </Button>
              )}
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>

        {/* Статистика по отфильтрованным транзакциям */}
        {filteredTransactions.length > 0 && <StatsSection />}
      </Card>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title="Добавить транзакцию"
      >
        <TransactionForm onSuccess={handleCloseForm} />
      </Modal>

      <Modal
        isOpen={!!editingTransaction}
        onClose={handleCloseEditModal}
        title="Редактировать транзакцию"
      >
        {editingTransaction && (
          <TransactionForm
            initialData={editingTransaction}
            onSuccess={handleCloseEditModal}
          />
        )}
      </Modal>
    </div>
  );
}
