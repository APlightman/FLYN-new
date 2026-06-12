import React from "react";
import { CalendarClock, ArrowRight } from "lucide-react";

interface PaymentItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  nextDate: string;
  daysUntil: number;
}

interface UpcomingPaymentsProps {
  payments: PaymentItem[];
  onNavigateToRecurring?: () => void;
}

export function UpcomingPayments({
  payments,
  onNavigateToRecurring,
}: UpcomingPaymentsProps) {
  if (payments.length === 0) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysLabel = (days: number) => {
    if (days < 0) return "Просрочен";
    if (days === 0) return "Сегодня";
    if (days === 1) return "Завтра";
    return `Через ${days} дн.`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg shadow-violet-500/25">
            <CalendarClock className="text-white" size={18} />
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
            Предстоящие платежи
          </h3>
        </div>
        {onNavigateToRecurring && (
          <button
            onClick={onNavigateToRecurring}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Все регулярные
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                  {payment.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {payment.category}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {formatCurrency(payment.amount)}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                  payment.daysUntil < 0
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : payment.daysUntil <= 1
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    : payment.daysUntil <= 7
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {getDaysLabel(payment.daysUntil)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
