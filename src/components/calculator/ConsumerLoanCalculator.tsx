import React, { useState, useEffect } from 'react';
import { CreditCard, AlertTriangle, Calculator, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LoanChart } from './charts/LoanChart';

export function ConsumerLoanCalculator() {
  const [formData, setFormData] = useState({
    loanAmount: '500000',
    interestRate: '18.5',
    loanTerm: '3',
    monthlyFee: '0',
    insurance: '0',
    earlyPaymentFee: '1',
    inflationRate: '6.5',
    adjustForInflation: true,
    paymentType: 'annuity' as 'annuity' | 'differentiated'
  });

  const [result, setResult] = useState({
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
    effectiveRate: 0,
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
      fees: number;
    }>
  });

  useEffect(() => {
    calculateConsumerLoan();
  }, [formData]);

  const calculateConsumerLoan = () => {
    const loanAmount = parseFloat(formData.loanAmount) || 0;
    const annualRate = parseFloat(formData.interestRate) / 100;
    const monthlyRate = annualRate / 12;
    const termMonths = parseFloat(formData.loanTerm) * 12;
    const monthlyFee = parseFloat(formData.monthlyFee) || 0;
    const insuranceAmount = parseFloat(formData.insurance) || 0;
    const monthlyInflation = parseFloat(formData.inflationRate) / 100 / 12;

    if (loanAmount <= 0 || termMonths <= 0) {
      setResult({
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        effectiveRate: 0,
        realTotalPayment: 0,
        inflationSavings: 0,
        earlyPaymentSavings: 0,
        paymentSchedule: []
      });
      return;
    }

    // Расчет базового платежа
    const baseMonthlyPayment = formData.paymentType === 'annuity'
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      : loanAmount / termMonths;

    let balance = loanAmount;
    let totalPayment = 0;
    let totalInterest = 0;
    const schedule = [];

    for (let month = 1; month <= termMonths; month++) {
      const interestPayment = balance * monthlyRate;
      
      let principalPayment: number;
      if (formData.paymentType === 'annuity') {
        principalPayment = baseMonthlyPayment - interestPayment;
      } else {
        principalPayment = loanAmount / termMonths;
      }

      // Дополнительные комиссии и страхование
      const fees = monthlyFee + (month === 1 ? insuranceAmount : 0);
      
      // Общий платеж
      const totalMonthlyPayment = principalPayment + interestPayment + fees;
      
      // Обновление баланса
      balance = Math.max(0, balance - principalPayment);
      
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
        fees
      });
    }

    // Расчет эффективной ставки
    const totalFees = schedule.reduce((sum, payment) => sum + payment.fees, 0);
    const effectiveRate = ((totalPayment / loanAmount - 1) / parseFloat(formData.loanTerm)) * 100;

    // Расчет экономии от инфляции
    const nominalTotal = schedule.reduce((sum, payment) => sum + payment.payment, 0);
    const realTotal = schedule.reduce((sum, payment) => sum + payment.realPayment, 0);
    const inflationSavings = nominalTotal - realTotal;

    setResult({
      monthlyPayment: baseMonthlyPayment + monthlyFee,
      totalPayment: nominalTotal,
      totalInterest,
      effectiveRate,
      realTotalPayment: realTotal,
      inflationSavings,
      earlyPaymentSavings: 0,
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

  const paymentTypeOptions = [
    { value: 'annuity', label: 'Аннуитетный (равные платежи)' },
    { value: 'differentiated', label: 'Дифференцированный (убывающие)' }
  ];

  const getRateColorClass = () => {
    const rate = parseFloat(formData.interestRate);
    if (rate >= 25) return 'text-red-600 dark:text-red-400';
    if (rate >= 20) return 'text-orange-600 dark:text-orange-400';
    if (rate >= 15) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Параметры кредита
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Сумма кредита"
              type="number"
              value={formData.loanAmount}
              onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
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

            <Select
              label="Тип платежей"
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as 'annuity' | 'differentiated' })}
              options={paymentTypeOptions}
              fullWidth
            />

            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                <strong>Дополнительные расходы</strong>
              </div>
              <div className="space-y-3">
                <Input
                  label="Ежемесячная комиссия"
                  type="number"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                  fullWidth
                />
                <Input
                  label="Страхование (единовременно)"
                  type="number"
                  value={formData.insurance}
                  onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                  fullWidth
                />
                <Input
                  label="Комиссия за досрочное погашение (%)"
                  type="number"
                  step="0.1"
                  value={formData.earlyPaymentFee}
                  onChange={(e) => setFormData({ ...formData, earlyPaymentFee: e.target.value })}
                  fullWidth
                />
              </div>
            </div>

            <Input
              label="Инфляция (%/год)"
              type="number"
              step="0.1"
              value={formData.inflationRate}
              onChange={(e) => setFormData({ ...formData, inflationRate: e.target.value })}
              fullWidth
            />

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
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="text-red-600 dark:text-red-400" size={20} />
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

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className={getRateColorClass()} size={20} />
                <span className="font-medium text-orange-800 dark:text-orange-200">
                  Эффективная ставка
                </span>
              </div>
              <div className={`text-2xl font-bold ${getRateColorClass()}`}>
                {result.effectiveRate.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                С учетом всех комиссий
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
                {((result.totalInterest / parseFloat(formData.loanAmount)) * 100).toFixed(1)}% от суммы
              </div>
            </div>

            {formData.adjustForInflation && result.inflationSavings > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Экономия от инфляции
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(result.inflationSavings)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Реальное снижение долговой нагрузки
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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

            {/* Предупреждения по высокой ставке */}
            {parseFloat(formData.interestRate) > 20 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={16} />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Высокая процентная ставка
                  </span>
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Рассмотрите альтернативы: рефинансирование, кредитная карта с льготным периодом, займ у близких
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
          title="График платежей по потребительскому кредиту"
          showCarValue={false}
        />
      )}

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Стратегии оптимизации кредита
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              💡 Способы экономии
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Рефинансирование под меньший процент</li>
              <li>• Досрочное погашение первых платежей</li>
              <li>• Перевод долга на кредитную карту</li>
              <li>• Консолидация нескольких кредитов</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📊 Альтернативы
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Кредитная карта с льготным периодом</li>
              <li>• Займ в МФО (на короткий срок)</li>
              <li>• Рассрочка от магазина</li>
              <li>• Накопить и купить за наличные</li>
            </ul>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
              ⚠️ Опасности
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• Скрытые комиссии и страховки</li>
              <li>• Навязанные дополнительные услуги</li>
              <li>• Штрафы за досрочное погашение</li>
              <li>• Долговая яма при неконтролируемых тратах</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🎯 Рекомендации
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Кредит только на инвестиции или необходимое</li>
              <li>• Читайте договор до подписания</li>
              <li>• Сравните предложения 3-5 банков</li>
              <li>• Создайте план досрочного погашения</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
