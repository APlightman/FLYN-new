import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Budget } from '../../types';
import { Button } from '../ui/Button';

interface BudgetDeleteConfirmProps {
  budget: Budget;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BudgetDeleteConfirm({ budget, onConfirm, onCancel }: BudgetDeleteConfirmProps) {
  const { state, deleteBudget } = useApp();

  const category = state.categories.find(c => c.id === budget.categoryId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleConfirm = () => {
    deleteBudget(budget.id);
    onConfirm();
  };

  const hasSpentMoney = budget.spent > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
        <div>
          <div className="font-semibold text-red-800 dark:text-red-200">
            Удаление бюджета
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">
            Это действие нельзя отменить
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category?.color || '#6b7280' }}
          />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {category?.name}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-500 dark:text-slate-400">Лимит:</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(budget.amount)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">Потрачено:</div>
            <div className={`font-semibold ${
              budget.spent > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-slate-900 dark:text-slate-100'
            }`}>
              {formatCurrency(budget.spent)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">Остаток:</div>
            <div className={`font-semibold ${
              budget.remaining >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(budget.remaining)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">Период:</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {budget.period === 'monthly' ? 'Месячный' : 'Годовой'}
            </div>
          </div>
        </div>
      </div>

      {hasSpentMoney && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Внимание:</strong> По этому бюджету уже есть траты ({formatCurrency(budget.spent)}). 
            Удаление бюджета не повлияет на существующие транзакции, но вы потеряете возможность 
            отслеживать лимиты для этой категории.
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-slate-700 dark:text-slate-300">
          Вы уверены, что хотите удалить бюджет для категории <strong>"{category?.name}"</strong>?
        </p>
        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Лимит бюджета будет удален</li>
          <li>• Отслеживание трат по этой категории прекратится</li>
          <li>• Существующие транзакции останутся без изменений</li>
          <li>• Вы сможете создать новый бюджет для этой категории позже</li>
        </ul>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel} fullWidth>
          Отмена
        </Button>
        <Button variant="danger" onClick={handleConfirm} fullWidth>
          <Trash2 size={16} className="mr-2" />
          Удалить бюджет
        </Button>
      </div>
    </div>
  );
}