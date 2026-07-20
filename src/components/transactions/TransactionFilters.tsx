import React from 'react';
import { Calendar, DollarSign, Tag, Type, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Card } from '../ui/Card';
import { Category } from '../../types';

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

interface TransactionFiltersProps {
  filters: QuickFilterState;
  onFiltersChange: (filters: QuickFilterState) => void;
  categories: Category[];
  onClearFilters: () => void;
}

export function TransactionFilters({ 
  filters, 
  onFiltersChange, 
  categories, 
  onClearFilters 
}: TransactionFiltersProps) {
  const updateFilters = (updates: Partial<QuickFilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const setQuickDate = (period: 'today' | 'week' | 'month' | 'year') => {
    const now = new Date();
    let start: Date;
    const end = new Date();

    switch (period) {
      case 'today':
        start = new Date();
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date();
    }

    updateFilters({
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      quickDate: period
    });
  };

  const toggleCategory = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName];
    
    updateFilters({ categories: newCategories });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.categories.length > 0) count++;
    if (filters.searchTerm) count++;
    if (filters.amountRange.min || filters.amountRange.max) count++;
    if (filters.quickDate) count++;
    return count;
  };

  const quickDateButtons = [
    { key: 'today', label: 'Сегодня', icon: '📅' },
    { key: 'week', label: 'Неделя', icon: '📆' },
    { key: 'month', label: 'Месяц', icon: '🗓️' },
    { key: 'year', label: 'Год', icon: '📋' },
  ] as const;

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Быстрые фильтры
        </h3>
        {getActiveFiltersCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X size={16} className="mr-1" />
            Очистить ({getActiveFiltersCount()})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Поиск */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск по описанию, категории, тегам..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              fullWidth
            />
          </div>
          <Select
            value={filters.type || ''}
            onChange={(e) => updateFilters({ 
              type: e.target.value ? e.target.value as 'income' | 'expense' : undefined 
            })}
            options={[
              { value: '', label: 'Все типы' },
              { value: 'income', label: 'Доходы' },
              { value: 'expense', label: 'Расходы' }
            ]}
          />
        </div>

        {/* Быстрые даты */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Быстрый выбор периода
          </label>
          <div className="flex gap-2 flex-wrap">
            {quickDateButtons.map(button => (
              <Button
                key={button.key}
                variant={filters.quickDate === button.key ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setQuickDate(button.key)}
              >
                <span className="mr-1">{button.icon}</span>
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Точные даты */}
        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="Дата от"
            value={filters.dateRange.start}
            onChange={(date) => updateFilters({
              dateRange: { ...filters.dateRange, start: date },
              quickDate: undefined
            })}
            fullWidth
          />
          <DatePicker
            label="Дата до"
            value={filters.dateRange.end}
            onChange={(date) => updateFilters({
              dateRange: { ...filters.dateRange, end: date },
              quickDate: undefined
            })}
            fullWidth
          />
        </div>

        {/* Диапазон сумм */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Сумма от"
            type="number"
            placeholder="0"
            value={filters.amountRange.min || ''}
            onChange={(e) => updateFilters({
              amountRange: {
                ...filters.amountRange,
                min: e.target.value ? parseFloat(e.target.value) : undefined
              }
            })}
            fullWidth
          />
          <Input
            label="Сумма до"
            type="number"
            placeholder="∞"
            value={filters.amountRange.max || ''}
            onChange={(e) => updateFilters({
              amountRange: {
                ...filters.amountRange,
                max: e.target.value ? parseFloat(e.target.value) : undefined
              }
            })}
            fullWidth
          />
        </div>

        {/* Категории */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Категории
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.name)}
                className={`
                  flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all duration-200
                  ${filters.categories.includes(category.name)
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }
                `}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Активные фильтры */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Активные фильтры:
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.type && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                  <Type size={12} />
                  <span>{filters.type === 'income' ? 'Доходы' : 'Расходы'}</span>
                  <button
                    onClick={() => updateFilters({ type: undefined })}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {filters.searchTerm && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-xs">
                  <Tag size={12} />
                  <span>"{filters.searchTerm}"</span>
                  <button
                    onClick={() => updateFilters({ searchTerm: '' })}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {filters.quickDate && (
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded text-xs">
                  <Calendar size={12} />
                  <span>{quickDateButtons.find(b => b.key === filters.quickDate)?.label}</span>
                  <button
                    onClick={() => updateFilters({ quickDate: undefined })}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {(filters.amountRange.min || filters.amountRange.max) && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded text-xs">
                  <DollarSign size={12} />
                  <span>
                    {filters.amountRange.min || 0} - {filters.amountRange.max || '∞'}
                  </span>
                  <button
                    onClick={() => updateFilters({ amountRange: {} })}
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              
              {filters.categories.map(category => (
                <div key={category} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                  <span>{category}</span>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
