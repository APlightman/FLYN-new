import React from "react";
import { PieChart } from "lucide-react";

interface CategoryItem {
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface CategoryPieChartProps {
  categories: CategoryItem[];
}

export function CategoryPieChart({ categories }: CategoryPieChartProps) {
  if (categories.length === 0) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Строим conic-gradient из категорий
  const conicGradient = categories
    .map((cat, i) => {
      const startPercent = categories
        .slice(0, i)
        .reduce((sum, c) => sum + c.percentage, 0);
      return `${cat.color} ${startPercent}% ${startPercent + cat.percentage}%`;
    })
    .join(", ");

  return (
    <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4 lg:mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg shadow-cyan-500/25">
          <PieChart className="text-white" size={18} />
        </div>
        <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
          Расходы по категориям
        </h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Круговая диаграмма */}
        <div className="flex-shrink-0">
          <div
            className="w-24 h-24 lg:w-28 lg:h-28 rounded-full shadow-inner"
            style={{
              background: `conic-gradient(${conicGradient})`,
            }}
          />
        </div>

        {/* Легенда */}
        <div className="flex-1 min-w-0 space-y-2">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1">
                {cat.name}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">
                {cat.percentage}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-500 flex-shrink-0 hidden sm:inline">
                {formatCurrency(cat.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
