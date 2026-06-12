import { useMemo } from "react";
import { useApp } from "../contexts/AppContext";
import type {
  Transaction,
  Budget,
  FinancialGoal,
  RecurringPayment,
} from "../types";

export interface DashboardData {
  /** Транзакции за текущий месяц */
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  /** Свободно: доход - расход - бюджеты */
  freeAmount: number;
  /** Топ-3 бюджета по проценту использования */
  topBudgets: (Budget & {
    spent: number;
    percentage: number;
    categoryName: string;
    categoryColor: string;
  })[];
  /** Топ-3 цели по прогрессу */
  topGoals: (FinancialGoal & { progress: number })[];
  /** Ближайшие 5 регулярных платежей */
  upcomingPayments: (RecurringPayment & { daysUntil: number })[];
  /** Расходы по категориям для диаграммы */
  categoryBreakdown: {
    name: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
  /** Последние 7 транзакций */
  recentTransactions: Transaction[];
  /** Есть ли хоть какие-то данные */
  hasData: boolean;
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function useDashboardData(): DashboardData {
  const { state } = useApp();
  const { transactions, categories, budgets, goals, recurringPayments } = state;

  return useMemo(() => {
    const monthRange = getMonthRange();

    // 1. Транзакции за текущий месяц
    const monthlyTransactions = transactions.filter((t) => {
      return t.date >= monthRange.start && t.date <= monthRange.end;
    });

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBalance = monthlyIncome - monthlyExpenses;

    // 2. Свободно: доход - расход - бюджеты
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const freeAmount = monthlyIncome - monthlyExpenses - totalBudgeted;

    // 3. Топ-3 бюджета по проценту использования
    const budgetsWithSpent = budgets.map((b) => {
      const spent = monthlyTransactions
        .filter((t) => t.type === "expense")
        .filter((t) => {
          const cat = categories.find((c) => c.id === b.categoryId);
          return cat && t.category === cat.name;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage =
        b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0;
      const category = categories.find((c) => c.id === b.categoryId);

      return {
        ...b,
        spent,
        percentage,
        categoryName: category?.name || "Без категории",
        categoryColor: category?.color || "#6b7280",
      };
    });

    const topBudgets = budgetsWithSpent
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);

    // 4. Топ-3 цели по прогрессу
    const goalsWithProgress = goals.map((g) => ({
      ...g,
      progress:
        g.targetAmount > 0
          ? Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100)
          : 0,
    }));

    const topGoals = goalsWithProgress
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);

    // 5. Ближайшие 5 регулярных платежей (включая просроченные — они в начале списка)
    const upcomingPayments = recurringPayments
      .filter((p) => p.isActive)
      .map((p) => ({
        ...p,
        daysUntil: daysUntil(p.nextDate),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    // 6. Расходы по категориям за месяц
    const expenseByCategory: Record<string, { amount: number; color: string }> =
      {};
    monthlyTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        if (!expenseByCategory[t.category]) {
          const cat = categories.find((c) => c.name === t.category);
          expenseByCategory[t.category] = {
            amount: 0,
            color: cat?.color || "#6b7280",
          };
        }
        expenseByCategory[t.category].amount += t.amount;
      });

    const totalExpenses = monthlyExpenses || 1; // избежать деления на 0
    const categoryBreakdown = Object.entries(expenseByCategory)
      .map(([name, data]) => ({
        name,
        color: data.color,
        amount: data.amount,
        percentage: Math.round((data.amount / totalExpenses) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // 7. Последние 7 транзакций
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);

    // 8. Есть ли данные
    const hasData =
      transactions.length > 0 || budgets.length > 0 || goals.length > 0;

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance,
      freeAmount,
      topBudgets,
      topGoals,
      upcomingPayments,
      categoryBreakdown,
      recentTransactions,
      hasData,
    };
  }, [transactions, categories, budgets, goals, recurringPayments]);
}
