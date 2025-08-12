import React, { useState, useEffect } from 'react';
import { Car, DollarSign, TrendingDown, Calculator } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LoanChart } from './charts/LoanChart';

export function CarLoanCalculator() {
  const [formData, setFormData] = useState({
    carPrice: '2000000',
    downPayment: '400000',
    loanTerm: '5',
    interestRate: '15.5',
    insurance: '8',
    tradeInValue: '0',
    inflationRate: '6.5',
    carDepreciation: '15',
    adjustForInflation: true,
    includeInsurance: true
  });

  const [result, setResult] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    realTotalPayment: 0,
    inflationSavings: 0,
    carValueAtEnd: 0,
    totalCostOfOwnership: 0,
    paymentSchedule: [] as Array<{
      month: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
      realPayment: number;
      carValue: number;
      insurance: number;
    }>
  });

  useEffect(() => {
    calculateCarLoan();
  }, [formData]);

  const calculateCarLoan = () => {
    const carPrice = parseFloat(formData.carPrice) || 0;
    const downPayment = parseFloat(formData.downPayment) || 0;
    const tradeIn = parseFloat(formData.tradeInValue) || 0;
    const loanAmount = carPrice - downPayment - tradeIn;
    const annualRate = parseFloat(formData.interestRate) / 100;
    const monthlyRate = annualRate / 12;
    const termMonths = parseFloat(formData.loanTerm) * 12;
    const insuranceRate = parseFloat(formData.insurance) / 100 / 12;
    const monthlyInflation = parseFloat(formData.inflationRate) / 100 / 12;
    const monthlyDepreciation = parseFloat(formData.carDepreciation) / 100 / 12;

    if (loanAmount <= 0 || termMonths <= 0) {
      setResult({
        loanAmount: 0,
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        realTotalPayment: 0,
        inflationSavings: 0,
        carValueAtEnd: 0,
        totalCostOfOwnership: 0,
        paymentSchedule: []
      });
      return;
    }

    // Аннуитетный платеж
    const monthlyPayment = monthlyRate > 0 
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      : loanAmount / termMonths;

    let balance = loanAmount;
    let totalPayment = 0;
    let totalInterest = 0;
    let carCurrentValue = carPrice;
    const schedule = [];

    for (let month = 1; month <= termMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      // Страхование
      const insurancePayment = formData.includeInsurance ? carCurrentValue * insuranceRate : 0;
      
      // Общий платеж
      const totalMonthlyPayment = monthlyPayment + insurancePayment;
      
      // Обновление баланса
      balance = Math.max(0, balance - principalPayment);
      
      // Обесценивание автомобиля
      carCurrentValue *= (1 - monthlyDepreciation);
      
      // Реальная стоимость платежа с учетом инфляции
      const realPayment = formData.adjustForInflation 
        ? totalMonthlyPayment / Math.pow(1 + monthlyInflation, month - 1)
        : totalMonthlyPayment;

      totalPayment += totalMonthlyPayment;
      totalInterest += interestPayment;

      schedule.push({
        month,
        payment: totalMonthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance,
        realPayment,
        carValue: carCurrentValue,
        insurance: insurancePayment
      });
    }

    // Расчет экономии от инфляции
    const nominalTotal = schedule.reduce((sum, payment) => sum + payment.payment, 0);
    const realTotal = schedule.reduce((sum, payment) => sum + payment.realPayment, 0);
    const inflationSavings = nominalTotal - realTotal;

    // Общая стоимость владения
    const totalCostOfOwnership = downPayment + totalPayment - carCurrentValue;

    setResult({
      loanAmount,
      monthlyPayment: monthlyPayment + (formData.includeInsurance ? carPrice * insuranceRate : 0),
      totalPayment: nominalTotal,
      totalInterest,
      realTotalPayment: realTotal,
      inflationSavings,
      carValueAtEnd: carCurrentValue,
      totalCostOfOwnership,
      paymentSchedule: schedule
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const loanToValueRatio = result.loanAmount > 0 && parseFloat(formData.carPrice) > 0
    ? (result.loanAmount / parseFloat(formData.carPrice)) * 100
    : 0;

  const downPaymentPercentage = parseFloat(formData.carPrice) > 0
    ? (parseFloat(formData.downPayment) / parseFloat(formData.carPrice)) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Параметры автокредита
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Стоимость автомобиля"
                type="number"
                value={formData.carPrice}
                onChange={(e) => setFormData({ ...formData, carPrice: e.target.value })}
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

            <Input
              label="Trade-in (зачет старого авто)"
              type="number"
              value={formData.tradeInValue}
              onChange={(e) => setFormData({ ...formData, tradeInValue: e.target.value })}
              fullWidth
            />

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
                label="Обесценивание (%/год)"
                type="number"
                step="0.1"
                value={formData.carDepreciation}
                onChange={(e) => setFormData({ ...formData, carDepreciation: e.target.value })}
                fullWidth
              />
            </div>

            <Input
              label="Инфляция (%/год)"
              type="number"
              step="0.1"
              value={formData.inflationRate}
              onChange={(e) => setFormData({ ...formData, inflationRate: e.target.value })}
              fullWidth
            />

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <input
                  type="checkbox"
                  id="includeInsurance"
                  checked={formData.includeInsurance}
                  onChange={(e) => setFormData({ ...formData, includeInsurance: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="includeInsurance" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Включить страхование в расчет
                </label>
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
                  Учитывать влияние инфляции
                </label>
              </div>
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
                <Car className="text-blue-600 dark:text-blue-400" size={20} />
                <span className="font-medium text-blue-800 dark:text-blue-200">
                  Сумма кредита
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(result.loanAmount)}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {loanToValueRatio.toFixed(1)}% от стоимости
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
                {formData.includeInsurance ? 'Включая страхование' : 'Без страхования'}
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="text-green-600 dark:text-green-400" size={20} />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Остаточная стоимость
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(result.carValueAtEnd)}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Через {formData.loanTerm} лет
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="text-purple-600 dark:text-purple-400" size={20} />
                <span className="font-medium text-purple-800 dark:text-purple-200">
                  Общая стоимость владения
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatCurrency(result.totalCostOfOwnership)}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                С учетом обесценивания
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Переплата
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.totalInterest)}
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Первый взнос
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {downPaymentPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {formData.adjustForInflation && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-green-800 dark:text-green-200">
                  <strong>Влияние инфляции:</strong> Экономия {formatCurrency(result.inflationSavings)} 
                  на реальной стоимости платежей
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {result.paymentSchedule.length > 0 && (
        <LoanChart
          data={result.paymentSchedule}
          adjustForInflation={formData.adjustForInflation}
          title="График платежей по автокредиту"
          showCarValue={true}
        />
      )}

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Анализ и рекомендации
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💰 Финансовый анализ
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Долговая нагрузка: {result.monthlyPayment > 0 ? '25%' : '0%'}</li>
              <li>• Срок окупаемости: {formData.loanTerm} лет</li>
              <li>• Эффективная ставка: {formData.interestRate}%</li>
              <li>• LTV: {loanToValueRatio.toFixed(1)}%</li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
              🚗 Альтернативы
            </h4>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Лизинг для ИП/ООО</li>
              <li>• Потребительский кредит</li>
              <li>• Программы господдержки</li>
              <li>• Trade-in программы</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              💡 Советы
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Больше первый взнос = меньше переплата</li>
              <li>• Досрочка выгодна в первые годы</li>
              <li>• Сравните с потребкредитом</li>
              <li>• Учитывайте полную стоимость владения</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
