import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { SavingsChart } from './charts/SavingsChart';
import { CompoundInterestComparison } from './charts/CompoundInterestComparison';

export function SavingsCalculator() {
  const [formData, setFormData] = useState({
    initialAmount: '100000',
    monthlyContribution: '10000',
    annualRate: '8',
    period: '10',
    compoundFrequency: '12',
    inflationRate: '6.5',
    adjustForInflation: true,
    targetAmount: '',
    calculationMode: 'forward' as 'forward' | 'reverse',
    showComparison: false,
    comparisonRate: '5' // Для сравнения простого процента
  });

  const [result, setResult] = useState({
    totalAmount: 0,
    totalContributions: 0,
    totalInterest: 0,
    realValue: 0,
    inflationLoss: 0,
    adjustedMonthlyContribution: 0,
    simpleInterestAmount: 0,
    compoundAdvantage: 0,
    monthlyBreakdown: [] as Array<{
      month: number;
      contribution: number;
      adjustedContribution: number;
      interest: number;
      balance: number;
      realValue: number;
      simpleInterestBalance: number;
      inflationRate: number;
    }>,
  });

  useEffect(() => {
    calculateSavings();
  }, [formData]);

  const calculateSavings = () => {
    const initial = parseFloat(formData.initialAmount) || 0;
    const monthly = parseFloat(formData.monthlyContribution) || 0;
    const rate = parseFloat(formData.annualRate) / 100 || 0;
    const years = parseFloat(formData.period) || 0;
    const frequency = parseFloat(formData.compoundFrequency) || 12;
    const inflationRate = parseFloat(formData.inflationRate) / 100 || 0;
    const adjustForInflation = formData.adjustForInflation;
    const comparisonRate = parseFloat(formData.comparisonRate) / 100 || 0;

    if (formData.calculationMode === 'reverse') {
      calculateRequiredContribution();
      return;
    }

    const months = years * 12;
    const monthlyRate = rate / frequency;
    const monthlyInflation = inflationRate / 12;
    const simpleMonthlyRate = comparisonRate / 12;
    
    let balance = initial;
    let totalContributions = initial;
    let simpleBalance = initial;
    const breakdown = [];
    
    for (let month = 1; month <= months; month++) {
      const inflationMultiplier = adjustForInflation 
        ? Math.pow(1 + monthlyInflation, month - 1)
        : 1;
      
      const adjustedContribution = monthly * inflationMultiplier;
      
      // Сложный процент
      const compoundInterest = balance * monthlyRate;
      balance += compoundInterest + adjustedContribution;
      
      // Простой процент для сравнения
      const simpleInterest = simpleBalance * simpleMonthlyRate;
      simpleBalance += simpleInterest + adjustedContribution;
      
      totalContributions += adjustedContribution;
      
      const realValue = balance / Math.pow(1 + monthlyInflation, month);
      
      breakdown.push({
        month,
        contribution: monthly,
        adjustedContribution,
        interest: compoundInterest,
        balance,
        realValue,
        simpleInterestBalance: simpleBalance,
        inflationRate: monthlyInflation * 12 * 100
      });
    }

    const totalInterest = balance - totalContributions;
    const finalRealValue = balance / Math.pow(1 + inflationRate, years);
    const inflationLoss = balance - finalRealValue;
    const simpleInterestTotal = simpleBalance - totalContributions;
    const compoundAdvantage = totalInterest - simpleInterestTotal;

    setResult({
      totalAmount: balance,
      totalContributions,
      totalInterest,
      realValue: finalRealValue,
      inflationLoss,
      adjustedMonthlyContribution: monthly * Math.pow(1 + monthlyInflation, months - 1),
      simpleInterestAmount: simpleBalance,
      compoundAdvantage,
      monthlyBreakdown: breakdown,
    });
  };

  const calculateRequiredContribution = () => {
    const targetAmount = parseFloat(formData.targetAmount) || 0;
    const initial = parseFloat(formData.initialAmount) || 0;
    const rate = parseFloat(formData.annualRate) / 100 || 0;
    const years = parseFloat(formData.period) || 0;
    const frequency = parseFloat(formData.compoundFrequency) || 12;
    const inflationRate = parseFloat(formData.inflationRate) / 100 || 0;
    const adjustForInflation = formData.adjustForInflation;

    if (years <= 0 || targetAmount <= initial) {
      setResult({
        totalAmount: 0,
        totalContributions: 0,
        totalInterest: 0,
        realValue: 0,
        inflationLoss: 0,
        adjustedMonthlyContribution: 0,
        simpleInterestAmount: 0,
        compoundAdvantage: 0,
        monthlyBreakdown: [],
      });
      return;
    }

    const months = years * 12;
    const monthlyRate = rate / frequency;
    const monthlyInflation = inflationRate / 12;

    const inflationAdjustedTarget = adjustForInflation 
      ? targetAmount * Math.pow(1 + inflationRate, years)
      : targetAmount;

    const futureValueInitial = initial * Math.pow(1 + monthlyRate, months);
    const requiredFromContributions = inflationAdjustedTarget - futureValueInitial;

    let requiredMonthly = 0;
    
    if (requiredFromContributions > 0) {
      if (monthlyRate > 0) {
        requiredMonthly = requiredFromContributions * monthlyRate / 
          (Math.pow(1 + monthlyRate, months) - 1);
      } else {
        requiredMonthly = requiredFromContributions / months;
      }
    }

    const breakdown = [];
    let balance = initial;
    let totalContributions = initial;

    for (let month = 1; month <= months; month++) {
      const inflationMultiplier = adjustForInflation 
        ? Math.pow(1 + monthlyInflation, month - 1)
        : 1;
      
      const adjustedContribution = requiredMonthly * inflationMultiplier;
      const interestEarned = balance * monthlyRate;
      
      balance += interestEarned + adjustedContribution;
      totalContributions += adjustedContribution;
      
      const realValue = balance / Math.pow(1 + monthlyInflation, month);
      
      breakdown.push({
        month,
        contribution: requiredMonthly,
        adjustedContribution,
        interest: interestEarned,
        balance,
        realValue,
        simpleInterestBalance: 0,
        inflationRate: monthlyInflation * 12 * 100
      });
    }

    const totalInterest = balance - totalContributions;
    const finalRealValue = balance / Math.pow(1 + inflationRate, years);

    setResult({
      totalAmount: balance,
      totalContributions,
      totalInterest,
      realValue: finalRealValue,
      inflationLoss: balance - finalRealValue,
      adjustedMonthlyContribution: requiredMonthly,
      simpleInterestAmount: 0,
      compoundAdvantage: 0,
      monthlyBreakdown: breakdown,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const compoundOptions = [
    { value: '1', label: 'Ежегодно' },
    { value: '4', label: 'Ежеквартально' },
    { value: '12', label: 'Ежемесячно' },
    { value: '365', label: 'Ежедневно' },
  ];

  const calculationModeOptions = [
    { value: 'forward', label: 'Рассчитать итоговую сумму' },
    { value: 'reverse', label: 'Рассчитать требуемый взнос' },
  ];

  const getInflationImpact = () => {
    const impactPercentage = (result.inflationLoss / result.totalAmount) * 100;
    return {
      percentage: impactPercentage,
      severity: impactPercentage > 30 ? 'high' : impactPercentage > 15 ? 'medium' : 'low'
    };
  };

  const inflationImpact = getInflationImpact();
  const compoundAdvantagePercentage = result.totalContributions > 0 
    ? (result.compoundAdvantage / result.totalContributions) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Параметры расчёта
          </h3>
          
          <div className="space-y-4">
            <Select
              label="Режим расчета"
              value={formData.calculationMode}
              onChange={(e) => setFormData({ ...formData, calculationMode: e.target.value as 'forward' | 'reverse' })}
              options={calculationModeOptions}
              fullWidth
            />

            {formData.calculationMode === 'reverse' && (
              <Input
                label="Целевая сумма"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="1000000"
                fullWidth
              />
            )}
            
            <Input
              label="Начальная сумма"
              type="number"
              value={formData.initialAmount}
              onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
              fullWidth
            />
            
            {formData.calculationMode === 'forward' && (
              <Input
                label="Ежемесячный взнос"
                type="number"
                value={formData.monthlyContribution}
                onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                fullWidth
              />
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Годовая доходность (%)"
                type="number"
                step="0.1"
                value={formData.annualRate}
                onChange={(e) => setFormData({ ...formData, annualRate: e.target.value })}
                fullWidth
              />
              
              <Input
                label="Период (лет)"
                type="number"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Инфляция в год (%)"
                type="number"
                step="0.1"
                value={formData.inflationRate}
                onChange={(e) => setFormData({ ...formData, inflationRate: e.target.value })}
                fullWidth
              />
              
              <Select
                label="Частота начисления"
                value={formData.compoundFrequency}
                onChange={(e) => setFormData({ ...formData, compoundFrequency: e.target.value })}
                options={compoundOptions}
                fullWidth
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <input
                type="checkbox"
                id="adjustForInflation"
                checked={formData.adjustForInflation}
                onChange={(e) => setFormData({ ...formData, adjustForInflation: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="adjustForInflation" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Корректировать взносы с учетом инфляции
              </label>
            </div>

            {/* Переключатель сравнения простого и сложного процента */}
            <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <button
                onClick={() => setFormData({ ...formData, showComparison: !formData.showComparison })}
                className="flex items-center gap-3 w-full"
              >
                {formData.showComparison ? (
                  <ToggleRight className="text-green-600 dark:text-green-400" size={24} />
                ) : (
                  <ToggleLeft className="text-slate-400" size={24} />
                )}
                <div className="text-left">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Сравнение с простым процентом
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Показать разницу между сложным и простым процентом
                  </div>
                </div>
              </button>
              
              {formData.showComparison && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Input
                    label="Ставка для сравнения (%)"
                    type="number"
                    step="0.1"
                    value={formData.comparisonRate}
                    onChange={(e) => setFormData({ ...formData, comparisonRate: e.target.value })}
                    fullWidth
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Результаты расчёта
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                <span className="font-medium text-green-800 dark:text-green-200">
                  {formData.calculationMode === 'forward' ? 'Итоговая сумма' : 'Достижение цели'}
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(result.totalAmount)}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Номинальная стоимость
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="text-blue-600 dark:text-blue-400" size={20} />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Реальная стоимость
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(result.realValue)}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                С учетом инфляции {formData.inflationRate}%
              </div>
            </div>

            {/* Преимущество сложного процента */}
            {formData.showComparison && result.compoundAdvantage > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
                  <span className="font-medium text-emerald-800 dark:text-emerald-200">
                    Преимущество сложного процента
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  +{formatCurrency(result.compoundAdvantage)}
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                  Дополнительный доход (+{compoundAdvantagePercentage.toFixed(1)}%)
                </div>
              </div>
            )}

            {result.inflationLoss > 0 && (
              <div className={`p-4 rounded-lg ${
                inflationImpact.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20' :
                inflationImpact.severity === 'medium' ? 'bg-orange-50 dark:bg-orange-900/20' :
                'bg-yellow-50 dark:bg-yellow-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`${
                    inflationImpact.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                    inflationImpact.severity === 'medium' ? 'text-orange-600 dark:text-orange-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`} size={20} />
                  <span className={`font-medium ${
                    inflationImpact.severity === 'high' ? 'text-red-800 dark:text-red-200' :
                    inflationImpact.severity === 'medium' ? 'text-orange-800 dark:text-orange-200' :
                    'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    Влияние инфляции
                  </span>
                </div>
                <div className={`text-xl font-bold ${
                  inflationImpact.severity === 'high' ? 'text-red-900 dark:text-red-100' :
                  inflationImpact.severity === 'medium' ? 'text-orange-900 dark:text-orange-100' :
                  'text-yellow-900 dark:text-yellow-100'
                }`}>
                  -{formatCurrency(result.inflationLoss)}
                </div>
                <div className={`text-sm ${
                  inflationImpact.severity === 'high' ? 'text-red-700 dark:text-red-300' :
                  inflationImpact.severity === 'medium' ? 'text-orange-700 dark:text-orange-300' :
                  'text-yellow-700 dark:text-yellow-300'
                }`}>
                  Потеря покупательной способности ({inflationImpact.percentage.toFixed(1)}%)
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Всего внесено
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.totalContributions)}
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Доход от процентов
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.totalInterest)}
                </div>
              </div>
            </div>

            {formData.calculationMode === 'reverse' && result.adjustedMonthlyContribution > 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">
                  Требуемый ежемесячный взнос
                </div>
                <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(result.adjustedMonthlyContribution)}
                </div>
                {formData.adjustForInflation && (
                  <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                    Начальный взнос (будет расти с инфляцией)
                  </div>
                )}
              </div>
            )}

            {formData.adjustForInflation && formData.calculationMode === 'forward' && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">
                  Последний взнос (с учетом инфляции)
                </div>
                <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  {formatCurrency(result.adjustedMonthlyContribution)}
                </div>
              </div>
            )}
            
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Эффективность инвестиций
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {result.totalContributions > 0 
                  ? `+${((result.totalInterest / result.totalContributions) * 100).toFixed(1)}% номинальный прирост`
                  : '0% прирост'
                }
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {result.totalContributions > 0 
                  ? `+${(((result.realValue - result.totalContributions) / result.totalContributions) * 100).toFixed(1)}% реальный прирост`
                  : '0% реальный прирост'
                }
              </div>
            </div>
          </div>
        </Card>

        {/* Результаты сравнения */}
        {formData.showComparison && (
          <CompoundInterestComparison
            compoundTotal={result.totalAmount}
            simpleTotal={result.simpleInterestAmount}
            advantage={result.compoundAdvantage}
            contributionsTotal={result.totalContributions}
            compoundRate={parseFloat(formData.annualRate)}
            simpleRate={parseFloat(formData.comparisonRate)}
          />
        )}
      </div>

      {result.monthlyBreakdown.length > 0 && (
        <SavingsChart
          data={result.monthlyBreakdown}
          showComparison={formData.showComparison}
          adjustForInflation={formData.adjustForInflation}
        />
      )}

      {formData.adjustForInflation && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Рекомендации по инфляционной защите
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                💡 Стратегия защиты от инфляции
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Увеличивайте взносы на уровень инфляции ежегодно</li>
                <li>• Рассматривайте инструменты с защитой от инфляции</li>
                <li>• Диверсифицируйте портфель активов</li>
                <li>• Пересматривайте цели каждые 2-3 года</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                📈 Альтернативные инструменты
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• ОФЗ-ИН (облигации с защитой от инфляции)</li>
                <li>• Акции качественных компаний</li>
                <li>• Недвижимость и REITs</li>
                <li>• Товарные ETF и драгметаллы</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
