import React, { useState } from 'react';
import { Target, Edit, Trash2, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { FinancialGoal } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { GoalForm } from './GoalForm';

export function GoalsManager() {
  const { state, deleteGoal } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  const calculateProgress = (goal: FinancialGoal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const calculateMonthsRemaining = (goal: FinancialGoal) => {
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const monthsRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return monthsRemaining;
  };

  const calculateRequiredMonthly = (goal: FinancialGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsRemaining = calculateMonthsRemaining(goal);
    return monthsRemaining > 0 ? remaining / monthsRemaining : 0;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Не указан';
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl shadow-lg shadow-orange-500/25">
            <Target className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Финансовые цели
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Планирование и достижение финансовых целей
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Добавить цель
        </Button>
      </div>

      {state.goals.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Target className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Нет финансовых целей
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Создайте свою первую финансовую цель и начните планировать будущее
            </p>
            <Button onClick={() => setShowForm(true)}>
              Создать цель
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.goals.map((goal) => {
            const progress = calculateProgress(goal);
            const monthsRemaining = calculateMonthsRemaining(goal);
            const requiredMonthly = calculateRequiredMonthly(goal);

            return (
              <Card key={goal.id} className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {goal.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(goal.priority)}`} />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {getPriorityText(goal.priority)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingGoal(goal)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Прогресс</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Накоплено</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Цель</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Осталось</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(goal.targetAmount - goal.currentAmount)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">До дедлайна</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {monthsRemaining} мес.
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Нужно в месяц</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(requiredMonthly)}
                      </span>
                    </div>
                  </div>

                  {goal.description && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {goal.description}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Создать финансовую цель"
      >
        <GoalForm onSuccess={() => setShowForm(false)} />
      </Modal>

      <Modal
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Редактировать цель"
      >
        {editingGoal && (
          <GoalForm
            initialData={editingGoal}
            onSuccess={() => setEditingGoal(null)}
          />
        )}
      </Modal>
    </div>
  );
}
