import React, { useState, useMemo } from 'react';
import { TrendingUp, Plus, Settings, Wand2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { BudgetWizard } from './BudgetWizard';
import { BudgetEnvelope } from './BudgetEnvelope';
import { BudgetOverview } from './BudgetOverview';
import { Budget } from '../../types';

export function BudgetManager() {
  const { state, addBudget } = useApp();
  const [showWizard, setShowWizard] = useState(false);

  // Вычисляем потраченные суммы для каждого бюджета
  const budgetsWithSpent = useMemo(() => {
    return state.budgets.map(budget => {
      const category = state.categories.find(c => c.id === budget.categoryId);
      const spent = state.transactions
        .filter(t => t.type === 'expense' && t.category === category?.name)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent
      };
    });
  }, [state.budgets, state.transactions, state.categories]);

  const handleWizardComplete = (budgets: Omit<Budget, 'id'>[]) => {
    budgets.forEach(budget => {
      addBudget(budget);
    });
    setShowWizard(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg shadow-green-500/25">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Управление бюджетом
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Конвертная система с умными рекомендациями
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {budgetsWithSpent.length > 0 && (
            <Button variant="secondary" onClick={() => setShowWizard(true)}>
              <Settings size={16} />
              Настроить
            </Button>
          )}
          <Button onClick={() => setShowWizard(true)}>
            <Wand2 size={16} />
            {budgetsWithSpent.length === 0 ? 'Создать бюджет' : 'Мастер бюджета'}
          </Button>
        </div>
      </div>

      {budgetsWithSpent.length === 0 ? (
        /* Пустое состояние */
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-6">💰</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Создайте свой первый бюджет
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Используйте проверенную конвертную систему бюджетирования с элементами правила 50/30/20 
              для эффективного управления финансами
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-2xl mb-2">🏠</div>
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                  Потребности
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Обязательные расходы: жильё, еда, транспорт
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Желания
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Развлечения, хобби, необязательные покупки
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                  Сбережения
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Накопления, инвестиции, экстренный фонд
                </p>
              </div>
            </div>
            
            <Button onClick={() => setShowWizard(true)} size="lg">
              <Wand2 size={20} className="mr-2" />
              Запустить мастер настройки
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Обзор бюджета */}
          <BudgetOverview budgets={budgetsWithSpent} />

          {/* Конверты бюджета */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Бюджетные конверты
              </h3>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {budgetsWithSpent.length} категорий
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgetsWithSpent.map(budget => {
                const category = state.categories.find(c => c.id === budget.categoryId);
                if (!category) return null;
                
                return (
                  <BudgetEnvelope
                    key={budget.id}
                    budget={budget}
                    category={category}
                  />
                );
              })}
            </div>
          </div>

          {/* Быстрые действия */}
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Быстрые действия
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowWizard(true)}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 size={16} />
                    <span className="font-semibold">Перенастроить бюджет</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Изменить пропорции и категории
                  </div>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => {/* TODO: Добавить функцию копирования на следующий месяц */}}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Plus size={16} />
                    <span className="font-semibold">Скопировать на следующий месяц</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Перенести текущие лимиты
                  </div>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => {/* TODO: Добавить функцию анализа */}}
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} />
                    <span className="font-semibold">Анализ эффективности</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Отчёт по соблюдению бюджета
                  </div>
                </div>
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Модальные окна */}
      <Modal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        title=""
        size="xl"
      >
        <BudgetWizard
          onComplete={handleWizardComplete}
          onClose={() => setShowWizard(false)}
        />
      </Modal>
    </div>
  );
}