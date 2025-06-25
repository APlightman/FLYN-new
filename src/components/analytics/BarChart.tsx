import React from 'react';

interface BarChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}

export function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.income, d.expenses]));
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full h-64">
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-end h-full gap-1">
              <div
                className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                style={{
                  height: `${(item.income / maxValue) * 100}%`,
                  minHeight: item.income > 0 ? '4px' : '0px',
                }}
                title={`Доходы: ${formatCurrency(item.income)}`}
              />
              <div
                className="w-full bg-red-500 rounded-b transition-all duration-300 hover:bg-red-600"
                style={{
                  height: `${(item.expenses / maxValue) * 100}%`,
                  minHeight: item.expenses > 0 ? '4px' : '0px',
                }}
                title={`Расходы: ${formatCurrency(item.expenses)}`}
              />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {item.month}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Доходы</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Расходы</span>
        </div>
      </div>
    </div>
  );
}
