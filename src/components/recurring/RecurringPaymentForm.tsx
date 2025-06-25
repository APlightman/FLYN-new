import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { RecurringPayment } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { CategorySelector } from '../categories/CategorySelector';

interface RecurringPaymentFormProps {
  initialData?: RecurringPayment;
  onSuccess: () => void;
}

export function RecurringPaymentForm({ initialData, onSuccess }: RecurringPaymentFormProps) {
  const { addRecurringPayment, updateRecurringPayment } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    nextDate: new Date().toISOString().split('T')[0],
    isActive: true,
    description: '',
    cronExpression: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        amount: initialData.amount.toString(),
        category: initialData.category,
        frequency: initialData.frequency,
        nextDate: initialData.nextDate,
        isActive: initialData.isActive,
        description: initialData.description || '',
        cronExpression: initialData.cronExpression || '',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Сумма должна быть больше 0';
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    if (!formData.nextDate) {
      newErrors.nextDate = 'Укажите дату следующего платежа';
    }

    if (formData.frequency === 'custom' && !formData.cronExpression.trim()) {
      newErrors.cronExpression = 'Для настраиваемой частоты укажите cron выражение';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNextDate = (frequency: string, currentDate: string) => {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        // Для custom оставляем как есть
        break;
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const paymentData = {
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      frequency: formData.frequency,
      nextDate: formData.nextDate,
      isActive: formData.isActive,
      description: formData.description.trim() || undefined,
      cronExpression: formData.frequency === 'custom' ? formData.cronExpression.trim() : undefined,
    };

    if (initialData) {
      updateRecurringPayment(initialData.id, paymentData);
    } else {
      addRecurringPayment(paymentData);
    }

    onSuccess();
  };

  const handleFrequencyChange = (frequency: string) => {
    setFormData(prev => ({
      ...prev,
      frequency: frequency as any,
      nextDate: frequency !== 'custom' ? calculateNextDate(frequency, prev.nextDate) : prev.nextDate
    }));
    
    if (errors.frequency) {
      setErrors(prev => ({ ...prev, frequency: '' }));
    }
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Ежедневно' },
    { value: 'weekly', label: 'Еженедельно' },
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'yearly', label: 'Ежегодно' },
    { value: 'custom', label: 'Настраиваемый (cron)' },
  ];

  const getFrequencyDescription = () => {
    switch (formData.frequency) {
      case 'daily':
        return 'Платеж будет выполняться каждый день';
      case 'weekly':
        return 'Платеж будет выполняться каждую неделю';
      case 'monthly':
        return 'Платеж будет выполняться каждый месяц';
      case 'yearly':
        return 'Платеж будет выполняться каждый год';
      case 'custom':
        return 'Используйте cron выражение для настройки расписания';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Название платежа"
        value={formData.name}
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value });
          if (errors.name) setErrors({ ...errors, name: '' });
        }}
        placeholder="Например: Аренда квартиры"
        required
        fullWidth
        error={errors.name}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Сумма"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => {
            setFormData({ ...formData, amount: e.target.value });
            if (errors.amount) setErrors({ ...errors, amount: '' });
          }}
          required
          fullWidth
          error={errors.amount}
        />
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Категория
          </label>
          <CategorySelector
            value={formData.category}
            onChange={(category) => {
              setFormData({ ...formData, category });
              if (errors.category) setErrors({ ...errors, category: '' });
            }}
            required
            fullWidth
            error={errors.category}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Частота"
          value={formData.frequency}
          onChange={(e) => handleFrequencyChange(e.target.value)}
          options={frequencyOptions}
          fullWidth
          error={errors.frequency}
        />
        
        <DatePicker
          label="Дата следующего платежа"
          value={formData.nextDate}
          onChange={(date) => {
            setFormData({ ...formData, nextDate: date });
            if (errors.nextDate) setErrors({ ...errors, nextDate: '' });
          }}
          required
          fullWidth
          error={errors.nextDate}
        />
      </div>

      {formData.frequency === 'custom' && (
        <Input
          label="Cron выражение"
          value={formData.cronExpression}
          onChange={(e) => {
            setFormData({ ...formData, cronExpression: e.target.value });
            if (errors.cronExpression) setErrors({ ...errors, cronExpression: '' });
          }}
          placeholder="0 0 1 * *"
          fullWidth
          error={errors.cronExpression}
        />
      )}

      <Input
        label="Описание (необязательно)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Дополнительная информация о платеже"
        fullWidth
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Активировать платеж сразу после создания
        </label>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Информация:</strong> {getFrequencyDescription()}
        </div>
        {formData.amount && (
          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Сумма: {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
            }).format(parseFloat(formData.amount) || 0)}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" fullWidth>
          {initialData ? 'Обновить платеж' : 'Создать платеж'}
        </Button>
      </div>
    </form>
  );
}
