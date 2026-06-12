import React from "react";
import { Trophy, ArrowRight } from "lucide-react";

interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  deadline: string;
}

interface GoalsProgressProps {
  goals: GoalItem[];
  onNavigateToGoals?: () => void;
}

export function GoalsProgress({
  goals,
  onNavigateToGoals,
}: GoalsProgressProps) {
  if (goals.length === 0) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-emerald-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-amber-500";
    return "bg-slate-400";
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/25">
            <Trophy className="text-white" size={18} />
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
            Цели
          </h3>
        </div>
        {onNavigateToGoals && (
          <button
            onClick={onNavigateToGoals}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Все цели
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {goal.name}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">
                {goal.progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(goal.progress)}`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>{formatCurrency(goal.currentAmount)}</span>
              <span>{formatCurrency(goal.targetAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
