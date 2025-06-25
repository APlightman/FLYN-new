import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Transaction } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { CategorySelector } from '../categories/CategorySelector';
import { useFormValidation, ValidationRules } from '../../hooks/useFormValidation';

interface TransactionFormProps {
  initialData?: Transaction;
  onSuccess: () => void;
}

interface TransactionFormData {
  type: 'income' | 'expense';
  amount: string;
  category: string;
  description: string;
  date: string;
  tags: string;
}

const validationSchema = {
  amount: ValidationRules.currency,
  category: ValidationRules.required,
  description: ValidationRules.description,
  date: ValidationRules.required,
};

export function TransactionForm({ initialData, onSuccess }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useApp();
  
  const {
    values,
    errors,
    isValid,
    setValue,
    setValues,
    validateAll,
    handleChange,
    reset
  } = useFormValidation<TransactionFormData>({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
  }, validationSchema);

  useEffect(() => {
    if (initialData) {
      setValues({
        type: initialData.type,
        amount: initialData.amount.toString(),
        category: initialData.category,
        description: initialData.description,
        date: initialData.date,
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, setValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }
    
    const transactionData = {
      type: values.type,
      amount: parseFloat(values.amount),
      category: values.category,
      description: values.description,
      date: values.date,
      tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (initialData) {
      updateTransaction(initialData.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    onSuccess();
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue('type', e.target.value as 'income' | 'expense');
    setValue('category', ''); // Reset category when type changes
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Тип"
          value={values.type}
          onChange={handleTypeChange}
          options={[
            { value: 'expense', label: 'Расход' },
            { value: 'income', label: 'Доход' },
          ]}
          fullWidth
        />
        <Input
          label="Сумма"
          type="number"
          step="0.01"
          value={values.amount}
          onChange={handleChange('amount')}
          required
          fullWidth
          error={errors.amount}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Категория
        </label>
        <CategorySelector
          value={values.category}
          onChange={(category) => setValue('category', category)}
          type={values.type}
          required
          fullWidth
          error={errors.category}
        />
      </div>

      <Input
        label="Описание"
        value={values.description}
        onChange={handleChange('description')}
        required
        fullWidth
        error={errors.description}
      />

      <DatePicker
        label="Дата"
        value={values.date}
        onChange={(date) => setValue('date', date)}
        required
        fullWidth
        error={errors.date}
      />

      <Input
        label="Теги (через запятую)"
        value={values.tags}
        onChange={handleChange('tags')}
        placeholder="работа, такси, обед"
        fullWidth
      />

      <div className="flex gap-2 pt-4">
        <Button type="submit" fullWidth disabled={!isValid}>
          {initialData ? 'Обновить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
}
