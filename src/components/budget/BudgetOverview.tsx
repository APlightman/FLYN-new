import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';
import { Card } from '../ui/Card';

interface BudgetOverviewProps {
  budgets: Array<{
    id: string;
    categoryId: string;
    amount: number;
    spent: number;
    remaining: number;
    group?: 'needs' | 'wants' | 'savings';
  }>;
  monthlyIncome?: number;
}

export function BudgetOverview({ budgets, monthlyIncome }: BudgetOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGroupStats = () => {
    const stats = {
      needs: { budgeted: 0, spent: 0, remaining: 0, count: 0 },
      wants: { budgeted: 0, spent: 0, remaining: 0, count: 0 },
      savings: { budgeted: 0, spent: 0, remaining: 0, count: 0 },
      total: { budgeted: 0, spent: 0, remaining: 0, count: budgets.length }
    };

    budgets.forEach(budget => {
      const group = budget.group || 'needs';
      stats[group].budgeted += budget.amount;
      stats[group].spent += budget.spent;
      stats[group].remaining += budget.remaining;
      stats[group].count += 1;

      stats.total.budgeted += budget.amount;
      stats.total.spent += budget.spent;
      stats.total.remaining += budget.remaining;
    });

    return stats;
  };

  const getOverBudgetCategories = () => {
    return budgets.filter(budget => budget.spent > budget.amount);
  };

  const getHealthScore = () => {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    
    if (totalBudgeted === 0) return 100;
    
    const utilizationRate = (totalSpent / totalBudgeted) * 100;
    const overBudgetCount = getOverBudgetCategories().length;
    
    let score = 100;
    
    // Штраф за превышение бюджета
    score -= overBudgetCount * 15;
    
    // Штраф за слишком высокое использование
    if (utilizationRate > 90) {
      score -= (utilizationRate - 90) * 2;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const stats = getGroupStats();
  const overBudgetCategories = getOverBudgetCategories();
  const healthScore = getHealthScore();

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <TrendingUp size={20} />;
    if (score >= 60) return <Target size={20} />;
    return <TrendingDown size={20} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Общая статистика */}
      <Card variant="elevated" className="lg:col-span-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Обзор бюджета
          </h3>
          <div className={`flex items-center gap-2 ${getHealthColor(healthScore)}`}>
            {getHealthIcon(healthScore)}
            <span className="font-bold">
              Здоровье: {healthScore.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(stats.total.budgeted)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Общий бюджет
            </div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(stats.total.spent)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Потрачено
            </div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className={`text-2xl font-bold ${
              stats.total.remaining >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(stats.total.remaining)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Остаток
            </div>
          </div>

          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.total.count}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Категорий
            </div>
          </div>
        </div>

        {monthlyIncome && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Использование дохода:</strong> {((stats.total.budgeted / monthlyIncome) * 100).toFixed(1)}% 
              от {formatCurrency(monthlyIncome)}
            </div>
          </div>
        )}
      </Card>

      {/* Статистика по группам */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🏠</span>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Потребности
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Бюджет:</span>
            <span className="font-medium">{formatCurrency(stats.needs.budgeted)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Потрачено:</span>
            <span className="font-medium">{formatCurrency(stats.needs.spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Остаток:</span>
            <span className={`font-medium ${
              stats.needs.remaining >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(stats.needs.remaining)}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-3">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((stats.needs.spent / stats.needs.budgeted) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🎯</span>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Желания
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Бюджет:</span>
            <span className="font-medium">{formatCurrency(stats.wants.budgeted)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Потрачено:</span>
            <span className="font-medium">{formatCurrency(stats.wants.spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Остаток:</span>
            <span className={`font-medium ${
              stats.wants.remaining >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(stats.wants.remaining)}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-3">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((stats.wants.spent / stats.wants.budgeted) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">💰</span>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Сбережения
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Бюджет:</span>
            <span className="font-medium">{formatCurrency(stats.savings.budgeted)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Потрачено:</span>
            <span className="font-medium">{formatCurrency(stats.savings.spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Остаток:</span>
            <span className={`font-medium ${
              stats.savings.remaining >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(stats.savings.remaining)}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-3">
            <div
              className="h-2 bg-purple-500 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((stats.savings.spent / stats.savings.budgeted) * 100, 100)}%` 
              }}
            />
          </div>
        </div>
      </Card>

      {/* Предупреждения */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
          <h4 className="font-semibold text-slate-900 dark:text-slate-100">
            Предупреждения
          </h4>
        </div>
        
        {overBudgetCategories.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-green-600 dark:text-green-400 mb-2">
              <TrendingUp size={32} className="mx-auto" />
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Все категории в пределах бюджета!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {overBudgetCategories.slice(0, 3).map(budget => (
              <div key={budget.id} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-sm font-medium text-red-800 dark:text-red-200">
                  Превышение бюджета
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  На {formatCurrency(budget.spent - budget.amount)}
                </div>
              </div>
            ))}
            {overBudgetCategories.length > 3 && (
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                И ещё {overBudgetCategories.length - 3} категорий
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}