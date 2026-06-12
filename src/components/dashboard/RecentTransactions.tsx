import React from "react";
import { ArrowRight, Wallet } from "lucide-react";
import type { Transaction, Category } from "../../types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onNavigateToTransactions?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function RecentTransactions({
  transactions,
  categories,
  onNavigateToTransactions,
}: RecentTransactionsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
          Последние транзакции
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {transactions.length}
          </span>
          {onNavigateToTransactions && transactions.length > 0 && (
            <button
              onClick={onNavigateToTransactions}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Все
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <div className="text-slate-400 mb-4">
              <Wallet size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Нет транзакций
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Добавьте свою первую транзакцию
            </p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const category = categories.find(
              (c) => c.name === transaction.category,
            );

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
                  <div
                    className="w-3 h-3 lg:w-4 lg:h-4 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: category?.color || "#6b7280" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm lg:text-base">
                      {transaction.description}
                    </p>
                    <div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="truncate">{transaction.category}</span>
                      <span>•</span>
                      <span className="flex-shrink-0">
                        {new Date(transaction.date).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`font-bold text-sm lg:text-lg flex-shrink-0 ml-2 ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
