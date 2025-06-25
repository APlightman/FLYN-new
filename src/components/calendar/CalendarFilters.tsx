import React from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Category } from '../../types';

interface CalendarFiltersProps {
  filters: {
    categories: string[];
    type?: 'income' | 'expense';
    showEmpty: boolean;
  };
  onFiltersChange: (filters: any) => void;
  categories: Category[];
  onClose: () => void;
}

export function CalendarFilters({ 
  filters, 
  onFiltersChange, 
  categories, 
  onClose 
}: CalendarFiltersProps) {
  const updateFilters = (updates: any) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCategory = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter(c => c !== categoryName)
      : [...filters.categories, categoryName];
    
    updateFilters({ categories: newCategories });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      showEmpty: true
    });
  };

  return (
    <div className="space-y-6">
      <Select
        label="Тип транзакций"
        value={filters.type || ''}
        onChange={(e) => updateFilters({ 
          type: e.target.value ? e.target.value as 'income' | 'expense' : undefined 
        })}
        options={[
          { value: '', label: 'Все типы' },
          { value: 'income', label: 'Только доходы' },
          { value: 'expense', label: 'Только расходы' }
        ]}
        fullWidth
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Категории
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map(category => (
            <label key={category.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(category.name)}
                onChange={() => toggleCategory(category.name)}
                className="rounded"
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showEmpty}
            onChange={(e) => updateFilters({ showEmpty: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Показывать дни без транзакций
          </span>
        </label>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button onClick={clearFilters} variant="secondary" fullWidth>
          Очистить
        </Button>
        <Button onClick={onClose} fullWidth>
          Применить
        </Button>
      </div>
    </div>
  );
}
