import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Category } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useFormValidation, ValidationRules } from '../../hooks/useFormValidation';

interface CategoryFormProps {
  initialData?: Category;
  onSuccess: () => void;
}

interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
  parent: string;
  budget: string;
}

const PREDEFINED_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151'
];

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const { state, addCategory, updateCategory } = useApp();

  const validationSchema = {
    name: {
      ...ValidationRules.categoryName,
      custom: (value: string) => {
        if (!value || value.trim().length < 2) {
          return 'Название должно содержать минимум 2 символа';
        }
        
        // Check for duplicate names
        const existingCategory = state.categories.find(
          cat => cat.name.toLowerCase() === value.toLowerCase() && 
                 cat.id !== initialData?.id
        );
        if (existingCategory) {
          return 'Категория с таким названием уже существует';
        }
        
        return null;
      }
    },
    budget: {
      custom: (value: string) => {
        if (!value) return null; // Budget is optional
        const budgetValue = parseFloat(value);
        if (isNaN(budgetValue) || budgetValue <= 0) {
          return 'Бюджет должен быть положительным числом';
        }
        if (budgetValue > 10000000) {
          return 'Бюджет не может превышать 10,000,000';
        }
        return null;
      }
    }
  };

  const {
    values,
    errors,
    isValid,
    setValue,
    setValues,
    validateAll,
    handleChange
  } = useFormValidation<CategoryFormData>({
    name: '',
    type: 'expense',
    color: PREDEFINED_COLORS[0],
    parent: '',
    budget: '',
  }, validationSchema);

  useEffect(() => {
    if (initialData) {
      setValues({
        name: initialData.name,
        type: initialData.type,
        color: initialData.color,
        parent: initialData.parent || '',
        budget: initialData.budget?.toString() || '',
      });
    }
  }, [initialData, setValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }
    
    const categoryData = {
      name: values.name.trim(),
      type: values.type,
      color: values.color,
      parent: values.parent || undefined,
      budget: values.budget && values.type === 'expense' ? parseFloat(values.budget) : undefined,
    };

    if (initialData) {
      updateCategory(initialData.id, categoryData);
    } else {
      addCategory(categoryData);
    }

    onSuccess();
  };

  const getAvailableParentCategories = () => {
    return state.categories.filter(cat => 
      cat.type === values.type && 
      !cat.parent && 
      cat.id !== initialData?.id
    );
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('type', e.target.value as 'income' | 'expense');
    setValue('parent', ''); // Reset parent when type changes
    if (e.target.value === 'income') {
      setValue('budget', ''); // Clear budget for income categories
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Название категории"
        value={values.name}
        onChange={handleChange('name')}
        placeholder="Например: Продукты питания"
        required
        fullWidth
        error={errors.name}
      />

      <Select
        label="Тип категории"
        value={values.type}
        onChange={handleTypeChange}
        options={[
          { value: 'expense', label: 'Расход' },
          { value: 'income', label: 'Доход' },
        ]}
        fullWidth
      />

      <Select
        label="Родительская категория (необязательно)"
        value={values.parent}
        onChange={handleChange('parent')}
        options={[
          { value: '', label: 'Нет (корневая категория)' },
          ...getAvailableParentCategories().map(cat => ({ 
            value: cat.id, 
            label: cat.name 
          }))
        ]}
        fullWidth
      />

      {values.type === 'expense' && (
        <Input
          label="Месячный бюджет (необязательно)"
          type="number"
          step="0.01"
          value={values.budget}
          onChange={handleChange('budget')}
          placeholder="0.00"
          fullWidth
          error={errors.budget}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Цвет категории
        </label>
        <div className="grid grid-cols-10 gap-2">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                values.color === color 
                  ? 'border-slate-900 dark:border-slate-100 shadow-lg' 
                  : 'border-slate-300 dark:border-slate-600'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"
            style={{ backgroundColor: values.color }}
          />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Предварительный просмотр
          </span>
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          {values.name || 'Название категории'} • {values.type === 'income' ? 'Доход' : 'Расход'}
          {values.parent && (
            <span className="text-blue-600 dark:text-blue-400">
              {' '}(подкатегория)
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" fullWidth disabled={!isValid}>
          {initialData ? 'Обновить категорию' : 'Создать категорию'}
        </Button>
      </div>
    </form>
  );
}
