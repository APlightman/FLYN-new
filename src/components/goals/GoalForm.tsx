import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { FinancialGoal } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { useFormValidation, ValidationRules } from '../../hooks/useFormValidation';

interface GoalFormProps {
  initialData?: FinancialGoal;
  onSuccess: () => void;
}

interface GoalFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  monthlyContribution: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  inflationRate: string;
  adjustForInflation: boolean;
  expectedReturn: string;
}

export function GoalForm({ initialData, onSuccess }: GoalFormProps) {
  const { addGoal, updateGoal } = useApp();

  const validationSchema = {
    name: ValidationRules.required,
    targetAmount: ValidationRules.currency,
    currentAmount: {
      min: 0,
      custom: (value: string) => {
        if (!value) return null; // Current amount can be 0
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          return 'Сумма не может быть отрицательной';
        }
        return null;
      }
    },
    deadline: ValidationRules.futureDate,
    monthlyContribution: {
      min: 0,
      custom: (value: string) => {
        if (!value) return null; // Can be calculated automatically
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          return 'Взнос не может быть отрицательным';
        }
        return null;
      }
    },
    inflationRate: ValidationRules.percentage,
    expectedReturn: ValidationRules.percentage,
  };

  const {
    values,
    errors,
    isValid,
    setValue,
    setValues,
    validateAll,
    handleChange
  } = useFormValidation<GoalFormData>({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    monthlyContribution: '',
    priority: 'medium',
    description: '',
    inflationRate: '6.5',
    adjustForInflation: true,
    expectedReturn: '8',
  }, validationSchema);

  useEffect(() => {
    if (initialData) {
      setValues({
        name: initialData.name,
        targetAmount: initialData.targetAmount.toString(),
        currentAmount: initialData.currentAmount.toString(),
        deadline: initialData.deadline,
        monthlyContribution: initialData.monthlyContribution.toString(),
        priority: initialData.priority,
        description: initialData.description || '',
        inflationRate: (initialData as any).inflationRate?.toString() || '6.5',
        adjustForInflation: (initialData as any).adjustForInflation ?? true,
        expectedReturn: (initialData as any).expectedReturn?.toString() || '8',
      });
    }
  }, [initialData, setValues]);

  const calculateRequirements = () => {
    const target = parseFloat(values.targetAmount) || 0;
    const current = parseFloat(values.currentAmount) || 0;
    const inflationRate = parseFloat(values.inflationRate) / 100 || 0;
    const expectedReturn = parseFloat(values.expectedReturn) / 100 || 0;
    
    if (!values.deadline || target <= 0) {
      return {
        requiredMonthly: 0,
        inflationAdjustedTarget: target,
        monthsToDeadline: 0,
      };
    }

    const deadline = new Date(values.deadline);
    const now = new Date();
    const monthsRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const yearsRemaining = monthsRemaining / 12;

    if (monthsRemaining <= 0) {
      return {
        requiredMonthly: 0,
        inflationAdjustedTarget: target,
        monthsToDeadline: 0,
      };
    }

    const inflationAdjustedTarget = values.adjustForInflation 
      ? target * Math.pow(1 + inflationRate, yearsRemaining)
      : target;

    const monthlyReturn = expectedReturn / 12;
    const futureValueCurrent = current * Math.pow(1 + monthlyReturn, monthsRemaining);
    const requiredFromContributions = inflationAdjustedTarget - futureValueCurrent;

    let requiredMonthly = 0;
    
    if (requiredFromContributions > 0) {
      if (monthlyReturn > 0) {
        requiredMonthly = requiredFromContributions * monthlyReturn / 
          (Math.pow(1 + monthlyReturn, monthsRemaining) - 1);
      } else {
        requiredMonthly = requiredFromContributions / monthsRemaining;
      }
    }

    return {
      requiredMonthly: Math.max(0, requiredMonthly),
      inflationAdjustedTarget,
      monthsToDeadline: monthsRemaining,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return;
    }

    const calculations = calculateRequirements();
    
    const goalData = {
      name: values.name,
      targetAmount: parseFloat(values.targetAmount),
      currentAmount: parseFloat(values.currentAmount) || 0,
      deadline: values.deadline,
      monthlyContribution: parseFloat(values.monthlyContribution) || calculations.requiredMonthly,
      priority: values.priority,
      description: values.description,
      inflationRate: parseFloat(values.inflationRate),
      adjustForInflation: values.adjustForInflation,
      expectedReturn: parseFloat(values.expectedReturn),
      inflationAdjustedTarget: calculations.inflationAdjustedTarget,
    };

    if (initialData) {
      updateGoal(initialData.id, goalData);
    } else {
      addGoal(goalData);
    }

    onSuccess();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  const calculations = calculateRequirements();
  const inflationImpact = calculations.inflationAdjustedTarget - parseFloat(values.targetAmount || '0');
  const inflationImpactPercentage = parseFloat(values.targetAmount) > 0 
    ? (inflationImpact / parseFloat(values.targetAmount)) * 100 
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Название цели"
        value={values.name}
        onChange={handleChange('name')}
        placeholder="Например: Отпуск в Европе"
        required
        fullWidth
        error={errors.name}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Целевая сумма (в текущих ценах)"
          type="number"
          step="0.01"
          value={values.targetAmount}
          onChange={handleChange('targetAmount')}
          required
          fullWidth
          error={errors.targetAmount}
        />
        <Input
          label="Уже накоплено"
          type="number"
          step="0.01"
          value={values.currentAmount}
          onChange={handleChange('currentAmount')}
          fullWidth
          error={errors.currentAmount}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DatePicker
          label="Дедлайн"
          value={values.deadline}
          onChange={(date) => setValue('deadline', date)}
          minDate={minDateString}
          required
          fullWidth
          error={errors.deadline}
        />
        <Select
          label="Приоритет"
          value={values.priority}
          onChange={handleChange('priority')}
          options={[
            { value: 'low', label: 'Низкий' },
            { value: 'medium', label: 'Средний' },
            { value: 'high', label: 'Высокий' },
          ]}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ожидаемая доходность (%/год)"
          type="number"
          step="0.1"
          value={values.expectedReturn}
          onChange={handleChange('expectedReturn')}
          fullWidth
          error={errors.expectedReturn}
        />
        <Input
          label="Прогноз инфляции (%/год)"
          type="number"
          step="0.1"
          value={values.inflationRate}
          onChange={handleChange('inflationRate')}
          fullWidth
          error={errors.inflationRate}
        />
      </div>

      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <input
          type="checkbox"
          id="adjustForInflation"
          checked={values.adjustForInflation}
          onChange={(e) => setValue('adjustForInflation', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="adjustForInflation" className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Корректировать цель и взносы с учетом инфляции
        </label>
      </div>

      {values.adjustForInflation && inflationImpact > 0 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Влияние инфляции:</strong> Для сохранения покупательной способности потребуется дополнительно {formatCurrency(inflationImpact)} (+{inflationImpactPercentage.toFixed(1)}%)
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            Итоговая цель: {formatCurrency(calculations.inflationAdjustedTarget)}
          </div>
        </div>
      )}

      <Input
        label="Планируемый ежемесячный взнос"
        type="number"
        step="0.01"
        value={values.monthlyContribution}
        onChange={handleChange('monthlyContribution')}
        placeholder={calculations.requiredMonthly > 0 ? formatCurrency(calculations.requiredMonthly) : '0'}
        fullWidth
        error={errors.monthlyContribution}
      />

      {calculations.requiredMonthly > 0 && calculations.monthsToDeadline > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Рекомендуемый ежемесячный взнос: </strong>
            {formatCurrency(calculations.requiredMonthly)}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Для достижения цели за {Math.ceil(calculations.monthsToDeadline / 12)} лет
            {values.adjustForInflation && ' (начальный взнос, будет расти с инфляцией)'}
          </div>
        </div>
      )}

      <Input
        label="Описание (необязательно)"
        value={values.description}
        onChange={handleChange('description')}
        placeholder="Дополнительные детали о цели..."
        fullWidth
      />

      <Button type="submit" fullWidth disabled={!isValid}>
        {initialData ? 'Обновить цель' : 'Создать цель'}
      </Button>
    </form>
  );
}
