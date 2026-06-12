import { LayoutDashboard, Plus, List } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useDashboardData } from "../../hooks/useDashboardData";
import { MetricsGrid } from "./MetricsGrid";
import { BudgetProgress } from "./BudgetProgress";
import { GoalsProgress } from "./GoalsProgress";
import { UpcomingPayments } from "./UpcomingPayments";
import { CategoryPieChart } from "./CategoryPieChart";
import { RecentTransactions } from "./RecentTransactions";

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { state } = useApp();
  const data = useDashboardData();

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Заголовок + быстрые действия */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/25">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Главная панель
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Обзор ваших финансов
            </p>
          </div>
        </div>

        {data.hasData && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange?.("transactions")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Добавить</span>
            </button>
            <button
              onClick={() => onTabChange?.("transactions")}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <List size={16} />
              <span className="hidden sm:inline">Все транзакции</span>
            </button>
          </div>
        )}
      </div>

      {/* Метрики за месяц */}
      <MetricsGrid
        monthlyIncome={data.monthlyIncome}
        monthlyExpenses={data.monthlyExpenses}
        monthlyBalance={data.monthlyBalance}
        freeAmount={data.freeAmount}
      />

      {/* Сетка: Бюджеты + Цели */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <BudgetProgress
          budgets={data.topBudgets}
          onNavigateToBudgets={() => onTabChange?.("budget")}
        />
        <GoalsProgress
          goals={data.topGoals}
          onNavigateToGoals={() => onTabChange?.("goals")}
        />
      </div>

      {/* Сетка: Регулярные платежи + Диаграмма */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <UpcomingPayments
          payments={data.upcomingPayments}
          onNavigateToRecurring={() => onTabChange?.("recurring")}
        />
        <CategoryPieChart categories={data.categoryBreakdown} />
      </div>

      {/* Последние транзакции */}
      <RecentTransactions
        transactions={data.recentTransactions}
        categories={state.categories}
        onNavigateToTransactions={() => onTabChange?.("transactions")}
      />
    </div>
  );
}
