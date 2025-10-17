import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Budget } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface BudgetEditFormProps {
  budget: Budget & { group?: string; percentage?: number };
  onSuccess: () => void;
  onCancel: () => void;
}

export function BudgetEditForm({ budget, onSuccess, onCancel }: BudgetEditFormProps) {
  const { state, updateBudget } = useApp();
  const [formData, setFormData] = useState({
    amount: budget.amount.toString(),
    period: budget.period,
    group: budget.group || 'needs',
    percentage: budget.percentage?.toString() || '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const category = state.categories.find(c => c.id === budget.categoryId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Сумма должна быть больше 0';
    }

    if (parseFloat(formData.amount) > 10000000) {
      newErrors.amount = 'Сумма не может превышать 10,000,000';
    }

    if (formData.percentage && (parseFloat(formData.percentage) < 0 || parseFloat(formData.percentage) > 100)) {
      newErrors.percentage = 'Процент должен быть от 0 до 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const updates = {
      amount: parseFloat(formData.amount),
      period: formData.period as 'monthly' | 'yearly',
      group: formData.group,
      percentage: parseFloat(formData.percentage) || undefined,
    };

    updateBudget(budget.id, updates);
    onSuccess();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const periodOptions = [
    { value: 'monthly', label: 'Месячный' },
    { value: 'yearly', label: 'Годовой' },
  ];

  const groupOptions = [
    { value: 'needs', label: '🏠 Потребности' },
    { value: 'wants', label: '🎯 Желания' },
    { value: 'savings', label: '💰 Сбережения' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category?.color || '#6b7280' }}
          />
          <h3 className="font-semibold text-blue-800 dark:text-blue-200">
            Редактирование бюджета: {category?.name}
          </h3>
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          Текущий лимит: {formatCurrency(budget.amount)} • 
          Потрачено: {formatCurrency(budget.spent)} • 
          Остаток: {formatCurrency(budget.remaining)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Лимит бюджета"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => {
            setFormData({ ...formData, amount: e.target.value });
            if (errors.amount) setErrors({ ...errors, amount: '' });
          }}
          placeholder="50000"
          required
          fullWidth
          error={errors.amount}
        />

        <Select
          label="Период"
          value={formData.period}
          onChange={(e) => setFormData({ ...formData, period: e.target.value })}
          options={periodOptions}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Группа бюджета"
          value={formData.group}
          onChange={(e) => setFormData({ ...formData, group: e.target.value })}
          options={groupOptions}
          fullWidth
        />

        <Input
          label="Процент от дохода (необязательно)"
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={formData.percentage}
          onChange={(e) => {
            setFormData({ ...formData, percentage: e.target.value });
            if (errors.percentage) setErrors({ ...errors, percentage: '' });
          }}
          placeholder="20"
          fullWidth
          error={errors.percentage}
        />
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Предварительный просмотр:
        </div>
        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {formatCurrency(parseFloat(formData.amount) || 0)} / {formData.period === 'monthly' ? 'месяц' : 'год'}
        </div>
        {formData.percentage && parseFloat(formData.percentage) > 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {formData.percentage}% от месячного дохода
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Отмена
        </Button>
        <Button type="submit" fullWidth>
          Сохранить изменения
        </Button>
      </div>
    </form>
  );
}