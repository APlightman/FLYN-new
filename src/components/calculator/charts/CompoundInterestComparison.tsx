import React from 'react';
import { TrendingUp, Zap, DollarSign } from 'lucide-react';
import { Card } from '../../ui/Card';

interface CompoundInterestComparisonProps {
  compoundTotal: number;
  simpleTotal: number;
  advantage: number;
  contributionsTotal: number;
  compoundRate: number;
  simpleRate: number;
}

export function CompoundInterestComparison({
  compoundTotal,
  simpleTotal,
  advantage,
  contributionsTotal,
  compoundRate,
  simpleRate
}: CompoundInterestComparisonProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const advantagePercentage = contributionsTotal > 0 
    ? (advantage / contributionsTotal) * 100 
    : 0;

  const getAdvantageLevel = () => {
    if (advantagePercentage >= 50) return { level: 'high', color: 'emerald', text: 'Огромное' };
    if (advantagePercentage >= 25) return { level: 'medium', color: 'blue', text: 'Значительное' };
    if (advantagePercentage >= 10) return { level: 'low', color: 'green', text: 'Заметное' };
    return { level: 'minimal', color: 'slate', text: 'Минимальное' };
  };

  const advantageInfo = getAdvantageLevel();

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Сила сложного процента
      </h3>
      
      <div className="space-y-4">
        {/* Визуальное сравнение */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="text-red-600 dark:text-red-400" size={20} />
              <span className="font-medium text-red-800 dark:text-red-200">
                Простой процент ({simpleRate}%)
              </span>
            </div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(simpleTotal)}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              Линейный рост капитала
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              <span className="font-medium text-green-800 dark:text-green-200">
                Сложный процент ({compoundRate}%)
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(compoundTotal)}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              Экспоненциальный рост
            </div>
          </div>
        </div>

        {/* Преимущество сложного процента */}
        <div className={`p-4 bg-${advantageInfo.color}-50 dark:bg-${advantageInfo.color}-900/20 rounded-lg border-2 border-${advantageInfo.color}-200 dark:border-${advantageInfo.color}-800`}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className={`text-${advantageInfo.color}-600 dark:text-${advantageInfo.color}-400`} size={24} />
            <span className={`font-bold text-${advantageInfo.color}-800 dark:text-${advantageInfo.color}-200`}>
              {advantageInfo.text} преимущество!
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold text-${advantageInfo.color}-900 dark:text-${advantageInfo.color}-100`}>
                +{formatCurrency(advantage)}
              </div>
              <div className={`text-sm text-${advantageInfo.color}-700 dark:text-${advantageInfo.color}-300`}>
                Дополнительный доход
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold text-${advantageInfo.color}-900 dark:text-${advantageInfo.color}-100`}>
                +{advantagePercentage.toFixed(1)}%
              </div>
              <div className={`text-sm text-${advantageInfo.color}-700 dark:text-${advantageInfo.color}-300`}>
                К вложенным средствам
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold text-${advantageInfo.color}-900 dark:text-${advantageInfo.color}-100`}>
                {((compoundTotal / simpleTotal - 1) * 100).toFixed(1)}%
              </div>
              <div className={`text-sm text-${advantageInfo.color}-700 dark:text-${advantageInfo.color}-300`}>
                Больше простого процента
              </div>
            </div>
          </div>
        </div>

        {/* Объяснение */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🧠 Почему сложный процент эффективнее?
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p>
              <strong>Простой процент:</strong> Проценты начисляются только на первоначальную сумму.
              Ваш доход растет линейно и предсказуемо.
            </p>
            <p>
              <strong>Сложный процент:</strong> Проценты начисляются на проценты! 
              Это создает эффект "снежного кома" - чем дольше период, тем больше разница.
            </p>
            <p className="font-medium">
              💡 Эйнштейн называл сложный процент "восьмым чудом света". 
              Время - ваш главный союзник в инвестировании!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
