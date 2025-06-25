export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringId?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  parent?: string;
  budget?: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  spent: number;
  remaining: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  inflationRate?: number;
  adjustForInflation?: boolean;
  expectedReturn?: number;
  inflationAdjustedTarget?: number;
}

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  cronExpression?: string;
  nextDate: string;
  isActive: boolean;
  description?: string;
}

export interface FilterOptions {
  dateRange: { start: string; end: string };
  categories: string[];
  type?: 'income' | 'expense';
  amountRange?: { min: number; max: number };
  searchTerm?: string;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: FinancialGoal[];
  recurringPayments: RecurringPayment[];
  filters: FilterOptions;
  darkMode: boolean;
  selectedDate: string | null;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
