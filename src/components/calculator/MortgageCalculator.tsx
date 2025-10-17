import React, { useState, useEffect, useCallback } from 'react';
import { Home, Calculator, TrendingDown, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { MortgageChart } from './charts/MortgageChart';

export function MortgageCalculator() {
  const [formData, setFormData] = useState({
    propertyPrice: '5000000',
    downPayment: '1000000',
    loanTerm: '25',
    interestRate: '12.5',
    paymentType: 'annuity' as 'annuity' | 'differentiated',
    earlyPayment: '0',
    earlyPaymentType: 'monthly' as 'monthly' | 'lump',
    earlyPaymentStrategy: 'term' as 'term' | 'payment',
    insurance: '0.5',
    inflationRate: '6.5',
    adjustForInflation: true
  });

  const [result, setResult] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    realTotalPayment: 0,
    inflationSavings: 0,
    earlyPaymentSavings: 0,
    paymentSchedule: [] as Array<{
      month: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
      realPayment: number;
      insurance: number;
    }>
  });

  const calculateMortgage = useCallback(() => {
    const propertyPrice = parseFloat(formData.propertyPrice) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const loanAmount = propertyPrice - downPayment;
    const annualRate = parseFloat(formData.interestRate) / 100;
    const monthlyRate = annualRate / 12;
    const termMonths = parseFloat(formData.loanTerm) * 12;
    const insuranceRate = parseFloat(formData.insurance) / 100 / 12;
    const monthlyInflation = parseFloat(formData.inflationRate) / 100 / 12;
    const earlyPayment = parseFloat(formData.earlyPayment) || 0;

    if (loanAmount <= 0 || termMonths <= 0) {
      setResult({
        loanAmount: 0,
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        realTotalPayment: 0,
        inflationSavings: 0,
        earlyPaymentSavings: 0,
        paymentSchedule: []
      });
      return;
    }

    let balance = loanAmount;
    let totalInterest = 0;
    const schedule = [];
    let month = 1;

    // Расчет базового платежа
    const baseMonthlyPayment = formData.paymentType === 'annuity'
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      : loanAmount / termMonths; // Базовая часть для дифференцированного

    while (balance > 0.01 && month <= termMonths) {
      // Расчет процентов
      const interestPayment = balance * monthlyRate;
      
      // Расчет основного долга
      let principalPayment: number;
      if (formData.paymentType === 'annuity') {
        principalPayment = baseMonthlyPayment - interestPayment;
      } else {
        // Дифференцированный платеж
        principalPayment = loanAmount / termMonths;
      }

      // Страхование
      const insurancePayment = balance * insuranceRate;

      // Досрочное погашение
      let additionalPayment = 0;
      if (earlyPayment > 0) {
        if (formData.earlyPaymentType === 'monthly') {
          additionalPayment = earlyPayment;
        } else if (formData.earlyPaymentType === 'lump' && month === 12) {
          additionalPayment = earlyPayment;
        }
      }

      // Общий платеж
      const totalMonthlyPayment = principalPayment + interestPayment + insurancePayment + additionalPayment;
      
      // Обновление баланса
      balance = Math.max(0, balance - principalPayment - additionalPayment);
      
      // Реальная стоимость платежа с учетом инфляции
      const realPayment = formData.adjustForInflation 
        ? totalMonthlyPayment / Math.pow(1 + monthlyInflation, month - 1)
        : totalMonthlyPayment;

      totalInterest += interestPayment;

      schedule.push({
        month,
        payment: totalMonthlyPayment,
        principal: principalPayment + additionalPayment,
        interest: interestPayment,
        balance,
        realPayment,
        insurance: insurancePayment
      });

      month++;

      // Защита от бесконечного цикла
      if (month > termMonths * 2) break;
    }

    // Расчет экономии от инфляции
    const nominalTotal = schedule.reduce((sum, payment) => sum + payment.payment, 0);
    const realTotal = schedule.reduce((sum, payment) => sum + payment.realPayment, 0);
    const inflationSavings = nominalTotal - realTotal;

    setResult({
      loanAmount,
      monthlyPayment: baseMonthlyPayment,
      totalPayment: nominalTotal,
      totalInterest,
      realTotalPayment: realTotal,
      inflationSavings,
      earlyPaymentSavings: 0, // TODO: Рассчитать экономию от досрочки
      paymentSchedule: schedule
    });
  }, [formData]);

  useEffect(() => {
    calculateMortgage();
  }, [calculateMortgage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const paymentTypeOptions = [
    { value: 'annuity', label: 'Аннуитетный (равные платежи)' },
    { value: 'differentiated', label: 'Дифференцированный (убывающие)' }
  ];

  const earlyPaymentTypeOptions = [
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'lump', label: 'Единовременно (через год)' }
  ];

  const loanToValueRatio = result.loanAmount > 0 && parseFloat(formData.propertyPrice) > 0
    ? (result.loanAmount / parseFloat(formData.propertyPrice)) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Параметры ипотеки
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Стоимость недвижимости"
                type="number"
                value={formData.propertyPrice}
                onChange={(e) => setFormData({ ...formData, propertyPrice: e.target.value })}
                fullWidth
              />
              <Input
                label="Первоначальный взнос"
                type="number"
                value={formData.downPayment}
                onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                fullWidth
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Процентная ставка (%)"
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                fullWidth
              />
              <Input
                label="Срок кредита (лет)"
                type="number"
                value={formData.loanTerm}
                onChange={(e) => setFormData({ ...formData, loanTerm: e.target.value })}
                fullWidth
              />
            </div>

            <Select
              label="Тип платежей"
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as 'annuity' | 'differentiated' })}
              options={paymentTypeOptions}
              fullWidth
            />

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>Досрочное погашение</strong>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Сумма"
                  type="number"
                  value={formData.earlyPayment}
                  onChange={(e) => setFormData({ ...formData, earlyPayment: e.target.value })}
                  fullWidth
                />
                <Select
                  label="Тип"
                  value={formData.earlyPaymentType}
                  onChange={(e) => setFormData({ ...formData, earlyPaymentType: e.target.value as 'monthly' | 'lump' })}
                  options={earlyPaymentTypeOptions}
                  fullWidth
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Страхование (%/год)"
                type="number"
                step="0.1"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                fullWidth
              />
              <Input
                label="Инфляция (%/год)"
                type="number"
                step="0.1"
                value={formData.inflationRate}
                onChange={(e) => setFormData({ ...formData, inflationRate: e.target.value })}
                fullWidth
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <input
                type="checkbox"
                id="adjustForInflation"
                checked={formData.adjustForInflation}
                onChange={(e) => setFormData({ ...formData, adjustForInflation: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="adjustForInflation" className="text-sm font-medium text-green-800 dark:text-green-200">
                Учитывать влияние инфляции на реальные платежи
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Результаты расчёта
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Home className="text-blue-600 dark:text-blue-400" size={20} />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Сумма кредита
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(result.loanAmount)}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                LTV: {loanToValueRatio.toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-red-600 dark:text-red-400" size={20} />
                <span className="font-medium text-red-800 dark:text-red-200">
                  Ежемесячный платеж
                </span>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(result.monthlyPayment)}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                {formData.paymentType === 'annuity' ? 'Фиксированный' : 'Первый платеж'}
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="text-purple-600 dark:text-purple-400" size={20} />
                <span className="font-medium text-purple-800 dark:text-purple-200">
                  Переплата
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(result.totalInterest)}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {result.loanAmount > 0 ? ((result.totalInterest / result.loanAmount) * 100).toFixed(1) : 0}% от суммы кредита
              </div>
            </div>

            {formData.adjustForInflation && result.inflationSavings > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="text-green-600 dark:text-green-400" size={20} />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Экономия от инфляции
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(result.inflationSavings)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Реальная стоимость платежей снижается
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Общая выплата
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.totalPayment)}
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Реальная стоимость
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.realTotalPayment)}
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>Анализ доступности:</strong>
              </div>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <div>• Рекомендуемый доход: {formatCurrency(result.monthlyPayment * 3)}</div>
                <div>• Долговая нагрузка: {result.monthlyPayment > 0 ? '33%' : '0%'} (рекомендуемо)</div>
                <div>• Первый взнос: {loanToValueRatio > 0 ? (100 - loanToValueRatio).toFixed(1) : 0}%</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {result.paymentSchedule.length > 0 && (
        <MortgageChart
          data={result.paymentSchedule}
          paymentType={formData.paymentType}
        />
      )}

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Советы по ипотеке в условиях инфляции
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ Преимущества инфляции
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Фиксированный платеж дешевеет со временем</li>
              <li>• Недвижимость растет в цене</li>
              <li>• Долг обесценивается в реальном выражении</li>
              <li>• Защита от девальвации валюты</li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
              ⚠️ Риски и стратегии
            </h4>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Высокие ставки в начале периода</li>
              <li>• Риск изменения доходов</li>
              <li>• Страхование - дополнительная нагрузка</li>
              <li>• Досрочка выгодна в первые годы</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
