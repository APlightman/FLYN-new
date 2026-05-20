import { Transaction, Category, Budget, FinancialGoal, RecurringPayment } from '../types';

interface UpdateCallback<T> {
  (items: T[]): void;
}

export const useTimeWebSync = () => {
  // Хранилище callback'ов для обновления данных
  const callbacks = {
    transactions: [] as UpdateCallback<Transaction>[],
    categories: [] as UpdateCallback<Category>[],
    budgets: [] as UpdateCallback<Budget>[],
    goals: [] as UpdateCallback<FinancialGoal>[],
    recurringPayments: [] as UpdateCallback<RecurringPayment>[],
  };

  // Ключи для localStorage
  const KEYS = {
    transactions: 'finance_transactions',
    categories: 'finance_categories',
    budgets: 'finance_budgets',
    goals: 'finance_goals',
    recurringPayments: 'finance_recurring_payments',
  };

  // Генерация уникального ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Загрузка данных из localStorage
  const loadFromStorage = <T,>(key: string): T[] => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return [];
    }
  };

  // Сохранение данных в localStorage
  const saveToStorage = <T,>(key: string, items: T[]): void => {
    try {
      localStorage.setItem(key, JSON.stringify(items));
      // Уведомляем все callback'и об изменении
      const eventType = key.replace('finance_', '') as keyof typeof callbacks;
      callbacks[eventType as keyof typeof callbacks].forEach(cb => cb(items));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // Установка callback'ов для обновления данных
  const setTransactionsUpdateCallback = (callback: UpdateCallback<Transaction>) => {
    callbacks.transactions.push(callback);
    // Сразу отправляем текущие данные
    callback(loadFromStorage<Transaction>(KEYS.transactions));
  };

  const setCategoriesUpdateCallback = (callback: UpdateCallback<Category>) => {
    callbacks.categories.push(callback);
    callback(loadFromStorage<Category>(KEYS.categories));
  };

  const setBudgetsUpdateCallback = (callback: UpdateCallback<Budget>) => {
    callbacks.budgets.push(callback);
    callback(loadFromStorage<Budget>(KEYS.budgets));
  };

  const setGoalsUpdateCallback = (callback: UpdateCallback<FinancialGoal>) => {
    callbacks.goals.push(callback);
    callback(loadFromStorage<FinancialGoal>(KEYS.goals));
  };

  const setRecurringPaymentsUpdateCallback = (callback: UpdateCallback<RecurringPayment>) => {
    callbacks.recurringPayments.push(callback);
    callback(loadFromStorage<RecurringPayment>(KEYS.recurringPayments));
  };

  // CRUD операции для транзакций
  const addTransaction = (transaction: Omit<Transaction, 'id'>): void => {
    const transactions = loadFromStorage<Transaction>(KEYS.transactions);
    const newTransaction: Transaction = { ...transaction, id: generateId() };
    transactions.push(newTransaction);
    saveToStorage(KEYS.transactions, transactions);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>): void => {
    const transactions = loadFromStorage<Transaction>(KEYS.transactions);
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      saveToStorage(KEYS.transactions, transactions);
    }
  };

  const deleteTransaction = (id: string): void => {
    const transactions = loadFromStorage<Transaction>(KEYS.transactions);
    const filtered = transactions.filter(t => t.id !== id);
    saveToStorage(KEYS.transactions, filtered);
  };

  // CRUD операции для категорий
  const addCategory = (category: Omit<Category, 'id'>): void => {
    const categories = loadFromStorage<Category>(KEYS.categories);
    const newCategory: Category = { ...category, id: generateId() };
    categories.push(newCategory);
    saveToStorage(KEYS.categories, categories);
  };

  const updateCategory = (id: string, updates: Partial<Category>): void => {
    const categories = loadFromStorage<Category>(KEYS.categories);
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      saveToStorage(KEYS.categories, categories);
    }
  };

  const deleteCategory = (id: string): void => {
    const categories = loadFromStorage<Category>(KEYS.categories);
    const filtered = categories.filter(c => c.id !== id);
    saveToStorage(KEYS.categories, filtered);
  };

  // CRUD операции для бюджетов
  const addBudget = (budget: Omit<Budget, 'id'>): void => {
    const budgets = loadFromStorage<Budget>(KEYS.budgets);
    const newBudget: Budget = { ...budget, id: generateId() };
    budgets.push(newBudget);
    saveToStorage(KEYS.budgets, budgets);
  };

  const updateBudget = (id: string, updates: Partial<Budget>): void => {
    const budgets = loadFromStorage<Budget>(KEYS.budgets);
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      saveToStorage(KEYS.budgets, budgets);
    }
  };

  const deleteBudget = (id: string): void => {
    const budgets = loadFromStorage<Budget>(KEYS.budgets);
    const filtered = budgets.filter(b => b.id !== id);
    saveToStorage(KEYS.budgets, filtered);
  };

  // CRUD операции для целей
  const addGoal = (goal: Omit<FinancialGoal, 'id'>): void => {
    const goals = loadFromStorage<FinancialGoal>(KEYS.goals);
    const newGoal: FinancialGoal = { ...goal, id: generateId() };
    goals.push(newGoal);
    saveToStorage(KEYS.goals, goals);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>): void => {
    const goals = loadFromStorage<FinancialGoal>(KEYS.goals);
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates };
      saveToStorage(KEYS.goals, goals);
    }
  };

  const deleteGoal = (id: string): void => {
    const goals = loadFromStorage<FinancialGoal>(KEYS.goals);
    const filtered = goals.filter(g => g.id !== id);
    saveToStorage(KEYS.goals, filtered);
  };

  // CRUD операции для регулярных платежей
  const addRecurringPayment = (payment: Omit<RecurringPayment, 'id'>): void => {
    const payments = loadFromStorage<RecurringPayment>(KEYS.recurringPayments);
    const newPayment: RecurringPayment = { ...payment, id: generateId() };
    payments.push(newPayment);
    saveToStorage(KEYS.recurringPayments, payments);
  };

  const updateRecurringPayment = (id: string, updates: Partial<RecurringPayment>): void => {
    const payments = loadFromStorage<RecurringPayment>(KEYS.recurringPayments);
    const index = payments.findIndex(p => p.id === id);
    if (index !== -1) {
      payments[index] = { ...payments[index], ...updates };
      saveToStorage(KEYS.recurringPayments, payments);
    }
  };

  const deleteRecurringPayment = (id: string): void => {
    const payments = loadFromStorage<RecurringPayment>(KEYS.recurringPayments);
    const filtered = payments.filter(p => p.id !== id);
    saveToStorage(KEYS.recurringPayments, filtered);
  };

  // Метод для ручной синхронизации (вызывается по интервалу)
  const syncData = async (): Promise<void> => {
    // В будущей реализации здесь будет синхронизация с облаком
    // Сейчас просто убеждаемся, что данные актуальны
    console.log('Syncing data...');
  };

  return {
    setTransactionsUpdateCallback,
    setCategoriesUpdateCallback,
    setBudgetsUpdateCallback,
    setGoalsUpdateCallback,
    setRecurringPaymentsUpdateCallback,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    syncData,
  };
};
