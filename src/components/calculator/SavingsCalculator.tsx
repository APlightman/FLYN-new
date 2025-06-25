import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export function SavingsCalculator() {
  const [formData, setFormData] = useState({
    initialAmount: '100000',
    monthlyContribution: '10000',
    annualRate: '8',
    period: '10',
    compoundFrequency: '12',
    inflationRate: '6.5', // Средняя инфляция в России
    adjustForInflation: true,
    targetAmount: '', // Для обратного расчета
    calculationMode: 'forward' as 'forward' | 'reverse'
  });

  const [result, setResult] = useState({
    totalAmount: 0,
    totalContributions: 0,
    totalInterest: 0,
    realValue: 0,
    inflationLoss: 0,
    adjustedMonthlyContribution: 0,
    monthlyBreakdown: [] as Array<{
      month: number;
      contribution: number;
      adjustedContribution: number;
      interest: number;
      balance: number;
      realValue: number;
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

    if (formData.calculationMode === 'reverse') {
      calculateRequiredContribution();
      return;
    }

    const months = years * 12;
    const monthlyRate = rate / frequency;
    const monthlyInflation = inflationRate / 12;
    
    let balance = initial;
    let totalContributions = initial;
    const breakdown = [];
    
    for (let month = 1; month <= months; month++) {
      // Расчет скорректированного взноса с учетом инфляции
      const inflationMultiplier = adjustForInflation 
        ? Math.pow(1 + monthlyInflation, month - 1)
        : 1;
      
      const adjustedContribution = monthly * inflationMultiplier;
      
      // Начисление процентов
      const interestEarned = balance * monthlyRate;
      
      // Обновление баланса
      balance += interestEarned + adjustedContribution;
      totalContributions += adjustedContribution;
      
      // Реальная стоимость с учетом инфляции
      const realValue = balance / Math.pow(1 + monthlyInflation, month);
      
      breakdown.push({
        month,
        contribution: monthly,
        adjustedContribution,
        interest: interestEarned,
        balance,
        realValue,
        inflationRate: monthlyInflation * 12 * 100
      });
    }

    const totalInterest = balance - totalContributions;
    const finalRealValue = balance / Math.pow(1 + inflationRate, years);
    const inflationLoss = balance - finalRealValue;

    setResult({
      totalAmount: balance,
      totalContributions,
      totalInterest,
      realValue: finalRealValue,
      inflationLoss,
      adjustedMonthlyContribution: monthly * Math.pow(1 + monthlyInflation, months - 1),
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
        monthlyBreakdown: [],
      });
      return;
    }

    const months = years * 12;
    const monthlyRate = rate / frequency;
    const monthlyInflation = inflationRate / 12;

    // Целевая сумма с учетом инфляции
    const inflationAdjustedTarget = adjustForInflation 
      ? targetAmount * Math.pow(1 + inflationRate, years)
      : targetAmount;

    // Будущая стоимость начального капитала
    const futureValueInitial = initial * Math.pow(1 + monthlyRate, months);

    // Требуемая сумма от взносов
    const requiredFromContributions = inflationAdjustedTarget - futureValueInitial;

    if (requiredFromContributions <= 0) {
      // Начального капитала достаточно
      setResult({
        totalAmount: futureValueInitial,
        totalContributions: initial,
        totalInterest: futureValueInitial - initial,
        realValue: targetAmount,
        inflationLoss: futureValueInitial - targetAmount,
        adjustedMonthlyContribution: 0,
        monthlyBreakdown: [],
      });
      return;
    }

    // Расчет требуемого ежемесячного взноса
    let requiredMonthly = 0;
    
    if (adjustForInflation) {
      // Сложная формула для взносов с учетом инфляции
      // Используем итеративный метод для точности
      let low = 0;
      let high = requiredFromContributions / months;
      let iterations = 0;
      const maxIterations = 100;
      const tolerance = 1;

      while (high - low > tolerance && iterations < maxIterations) {
        const mid = (low + high) / 2;
        const testResult = simulateContributions(mid, months, monthlyRate, monthlyInflation);
        
        if (testResult < requiredFromContributions) {
          low = mid;
        } else {
          high = mid;
        }
        iterations++;
      }
      
      requiredMonthly = (low + high) / 2;
    } else {
      // Стандартная формула аннуитета
      if (monthlyRate > 0) {
        requiredMonthly = requiredFromContributions * monthlyRate / 
          (Math.pow(1 + monthlyRate, months) - 1);
      } else {
        requiredMonthly = requiredFromContributions / months;
      }
    }

    // Симуляция для получения детального breakdown
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
      monthlyBreakdown: breakdown,
    });
  };

  const simulateContributions = (monthlyAmount: number, months: number, monthlyRate: number, monthlyInflation: number) => {
    let balance = 0;
    
    for (let month = 1; month <= months; month++) {
      const inflationMultiplier = Math.pow(1 + monthlyInflation, month - 1);
      const adjustedContribution = monthlyAmount * inflationMultiplier;
      const interestEarned = balance * monthlyRate;
      balance += interestEarned + adjustedContribution;
    }
    
    return balance;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="text-blue-600 dark:text-blue-400" size={24} />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Калькулятор накоплений с учетом инфляции
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Умный расчет с корректировкой на инфляцию
          </p>
        </div>
      </div>

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
      </div>

      {result.monthlyBreakdown.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            График роста капитала
          </h3>
          
          <div className="h-64 flex items-end justify-between gap-1 mb-4">
            {result.monthlyBreakdown
              .filter((_, index) => index % Math.ceil(result.monthlyBreakdown.length / 12) === 0)
              .map((item, index) => {
                const maxBalance = Math.max(...result.monthlyBreakdown.map(b => b.balance));
                const maxRealValue = Math.max(...result.monthlyBreakdown.map(b => b.realValue));
                const nominalHeight = (item.balance / maxBalance) * 100;
                const realHeight = (item.realValue / maxRealValue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${nominalHeight}%`, minHeight: '4px' }}
                        title={`Месяц ${item.month}: ${formatCurrency(item.balance)} (номинал)`}
                      />
                      <div
                        className="w-full bg-green-500 rounded-b transition-all duration-300 hover:bg-green-600 opacity-70"
                        style={{ height: `${realHeight}%`, minHeight: '4px' }}
                        title={`Месяц ${item.month}: ${formatCurrency(item.realValue)} (реальная стоимость)`}
                      />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {Math.ceil(item.month / 12)}г
                    </div>
                  </div>
                );
              })}
          </div>
          
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Номинальная стоимость</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded opacity-70" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Реальная стоимость</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            График показывает рост капитала с учетом инфляции {formData.inflationRate}% в год
          </div>
        </Card>
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