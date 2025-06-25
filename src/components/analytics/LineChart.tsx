import React from 'react';

interface LineChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}

export function LineChart({ data }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => Math.abs(d.net)));
  const minValue = Math.min(...data.map(d => d.net));
  const range = maxValue - minValue;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 280 + 20;
    const y = range > 0 ? 180 - ((item.net - minValue) / range) * 140 : 100;
    return { x, y, value: item.net, month: item.month };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full h-64">
      <svg width="100%" height="200" viewBox="0 0 320 200" className="overflow-visible">
        {/* Горизонтальная линия нуля */}
        {minValue < 0 && (
          <line
            x1="20"
            y1={180 - ((-minValue) / range) * 140}
            x2="300"
            y2={180 - ((-minValue) / range) * 140}
            stroke="currentColor"
            strokeDasharray="2,2"
            className="text-slate-300 dark:text-slate-600"
          />
        )}
        
        {/* Линия графика */}
        <path
          d={pathData}
          fill="none"
          stroke="rgb(59 130 246)"
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Точки на графике */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(59 130 246)"
              className="hover:r-6 transition-all cursor-pointer"
            />
            <title>{`${point.month}: ${formatCurrency(point.value)}`}</title>
          </g>
        ))}
      </svg>
      
      {/* Подписи месяцев */}
      <div className="flex justify-between mt-2 px-2">
        {data.map((item, index) => (
          <div key={index} className="text-xs text-slate-600 dark:text-slate-400 text-center">
            {item.month}
          </div>
        ))}
      </div>
    </div>
  );
}
