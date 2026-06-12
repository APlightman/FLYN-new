import React from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

interface MetricsGridProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  freeAmount: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function MetricsGrid({
  monthlyIncome,
  monthlyExpenses,
  monthlyBalance,
  freeAmount,
}: MetricsGridProps) {
  const metrics = [
    {
      label: "Доходы за месяц",
      value: monthlyIncome,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      shadow: "shadow-green-500/25",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Расходы за месяц",
      value: monthlyExpenses,
      icon: TrendingDown,
      color: "from-red-500 to-red-600",
      shadow: "shadow-red-500/25",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      label: "Баланс",
      value: monthlyBalance,
      icon: Wallet,
      color:
        monthlyBalance >= 0
          ? "from-blue-500 to-blue-600"
          : "from-orange-500 to-orange-600",
      shadow:
        monthlyBalance >= 0 ? "shadow-blue-500/25" : "shadow-orange-500/25",
      textColor:
        monthlyBalance >= 0
          ? "text-blue-600 dark:text-blue-400"
          : "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Свободно",
      value: freeAmount,
      icon: PiggyBank,
      color: "from-teal-500 to-teal-600",
      shadow: "shadow-teal-500/25",
      textColor: "text-teal-600 dark:text-teal-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {metrics.map((metric) => {
        const IconComponent = metric.icon;
        return (
          <div
            key={metric.label}
            className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div
                className={`p-2 lg:p-3 bg-gradient-to-br ${metric.color} rounded-xl lg:rounded-2xl shadow-lg ${metric.shadow} flex-shrink-0`}
              >
                <IconComponent className="text-white" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1 text-xs lg:text-sm truncate">
                  {metric.label}
                </p>
                <p
                  className={`text-lg lg:text-2xl font-bold ${metric.textColor} truncate`}
                >
                  {formatCurrency(metric.value)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
