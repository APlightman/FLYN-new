import React from "react";
import { Target, ArrowRight } from "lucide-react";

interface BudgetItem {
  id: string;
  amount: number;
  spent: number;
  percentage: number;
  categoryName: string;
  categoryColor: string;
}

interface BudgetProgressProps {
  budgets: BudgetItem[];
  onNavigateToBudgets?: () => void;
}

export function BudgetProgress({
  budgets,
  onNavigateToBudgets,
}: BudgetProgressProps) {
  if (budgets.length === 0) return null;

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/25">
            <Target className="text-white" size={18} />
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
            Бюджеты
          </h3>
        </div>
        {onNavigateToBudgets && (
          <button
            onClick={onNavigateToBudgets}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Все бюджеты
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {budgets.map((budget) => (
          <div key={budget.id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: budget.categoryColor }}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {budget.categoryName}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                {budget.percentage}% · {formatCurrency(budget.spent)} /{" "}
                {formatCurrency(budget.amount)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(budget.percentage)}`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
