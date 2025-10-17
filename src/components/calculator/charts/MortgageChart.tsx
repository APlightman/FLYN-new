import React from 'react';
import { Card } from '../../ui/Card';

interface MortgageChartProps {
  data: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    realPayment: number;
  }>;
  paymentType: 'annuity' | 'differentiated';
}

export function MortgageChart({ data, paymentType }: MortgageChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxPayment = Math.max(...data.map(d => d.payment));
  const maxBalance = Math.max(...data.map(d => d.balance));
  
  const chartData = data.filter((_, index) => 
    index % Math.ceil(data.length / 24) === 0 || index === data.length - 1
  );

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        График погашения ипотеки
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График платежей */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
            Структура платежей
          </h4>
          <div className="h-64 flex items-end justify-between gap-1 mb-4">
            {chartData.map((item, index) => {
              const principalHeight = (item.principal / maxPayment) * 100;
              const interestHeight = (item.interest / maxPayment) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 max-w-[30px]">
                  <div className="w-full flex flex-col-reverse">
                    <div
                      className="w-full bg-blue-500 transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${principalHeight}%`, minHeight: '2px' }}
                      title={`Основной долг: ${formatCurrency(item.principal)}`}
                    />
                    <div
                      className="w-full bg-red-500 transition-all duration-300 hover:bg-red-600"
                      style={{ height: `${interestHeight}%`, minHeight: '2px' }}
                      title={`Проценты: ${formatCurrency(item.interest)}`}
                    />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {Math.ceil(item.month / 12)}г
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Основной долг</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Проценты</span>
            </div>
          </div>
        </div>

        {/* График остатка долга */}
        <div>
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
            Остаток задолженности
          </h4>
          <div className="h-64 flex items-end justify-between gap-1 mb-4">
            {chartData.map((item, index) => {
              const balanceHeight = (item.balance / maxBalance) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 max-w-[30px]">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-purple-500 transition-all duration-300 hover:from-purple-700 hover:to-purple-600"
                    style={{ height: `${balanceHeight}%`, minHeight: '2px' }}
                    title={`Остаток: ${formatCurrency(item.balance)}`}
                  />
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {Math.ceil(item.month / 12)}г
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            Снижение задолженности по месяцам
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          <strong>Тип платежей:</strong> {paymentType === 'annuity' ? 'Аннуитетный' : 'Дифференцированный'}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {paymentType === 'annuity' 
            ? 'Равные платежи, в начале больше процентов, в конце больше основного долга'
            : 'Убывающие платежи, основной долг равными частями, проценты уменьшаются'
          }
        </div>
      </div>
    </Card>
  );
}