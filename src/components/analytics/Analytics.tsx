import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { BarChart } from './BarChart';
import { PieChartComponent } from './PieChartComponent';
import { LineChart } from './LineChart';

export function Analytics() {
  const { state } = useApp();

  const analyticsData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpenses;

    // Группировка по категориям
    const categoryData = state.categories.map(category => {
      const amount = currentMonthTransactions
        .filter(t => t.category === category.name)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: category.name,
        amount,
        color: category.color,
        percentage: totalExpenses > 0 && category.type === 'expense' 
          ? (amount / totalExpenses) * 100 
          : 0,
      };
    }).filter(item => item.amount > 0);

    // Данные по месяцам (последние 6 месяцев)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthTransactions = state.transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        income,
        expenses,
        net: income - expenses,
      });
    }

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      categoryData,
      monthlyData,
    };
  }, [state.transactions, state.categories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg shadow-emerald-500/25">
          <PieChart className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Аналитика и отчёты
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Детальный анализ ваших финансов
          </p>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Доходы</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(analyticsData.totalIncome)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
              <TrendingDown className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Расходы</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(analyticsData.totalExpenses)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              analyticsData.netIncome >= 0 
                ? 'bg-blue-100 dark:bg-blue-900' 
                : 'bg-orange-100 dark:bg-orange-900'
            }`}>
              <DollarSign className={`${
                analyticsData.netIncome >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`} size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Баланс</div>
              <div className={`text-xl font-bold ${
                analyticsData.netIncome >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(analyticsData.netIncome)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <PieChart className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Категорий</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {analyticsData.categoryData.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Доходы vs Расходы
          </h3>
          <BarChart data={analyticsData.monthlyData} />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Расходы по категориям
          </h3>
          <PieChartComponent data={analyticsData.categoryData.filter(d => d.amount > 0)} />
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Тренд баланса
        </h3>
        <LineChart data={analyticsData.monthlyData} />
      </Card>

      {/* Детальная статистика */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Статистика по категориям
        </h3>
        <div className="space-y-3">
          {analyticsData.categoryData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(item.amount)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
