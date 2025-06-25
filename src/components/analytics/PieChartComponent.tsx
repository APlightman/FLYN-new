import React from 'react';

interface PieChartProps {
  data: Array<{
    name: string;
    amount: number;
    color: string;
    percentage: number;
  }>;
}

export function PieChartComponent({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  let cumulativePercentage = 0;
  const slices = data.map((item) => {
    const percentage = (item.amount / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  const createArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 dark:text-slate-400">
        Нет данных для отображения
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={createArcPath(100, 100, 80, slice.startAngle, slice.endAngle)}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              title={`${slice.name}: ${formatCurrency(slice.amount)} (${slice.percentage.toFixed(1)}%)`}
            />
          ))}
        </svg>
      </div>
      
      <div className="space-y-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {slice.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatCurrency(slice.amount)} ({slice.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
