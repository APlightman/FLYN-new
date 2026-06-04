/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction, Category, Budget, FinancialGoal, RecurringPayment } from '../types';

// =================================================================
// DESKTOP (SQLite) IMPLEMENTATION
// This implementation uses the electronAPI exposed from the main process
// to interact with the local SQLite database.
// =================================================================

// Helper to call Electron's IPC functions and handle potential errors
const callIPC = async (channel: string, ...args: any[]): Promise<any> => {
  if (window.electronAPI && typeof window.electronAPI[channel] === 'function') {
    try {
      const result = await window.electronAPI[channel](...args);
      if (result && result.success) {
        return result.item || result;
      }
      if (result && !result.success) {
        throw new Error(result.error || `IPC call to ${channel} failed.`);
      }
      return result;
    } catch (error) {
      console.error(`Error in IPC call ${channel}:`, error);
      throw error;
    }
  }
  // This fallback will be used if the app is somehow not in Electron, preventing crashes.
  console.warn(`Electron API or channel "${channel}" not found. Using mock data.`);
  return Promise.resolve([]); // Return empty array to avoid breaking UI
};

// Generic function to get all items of a certain type
const getAllFactory = <T>(entityType: keyof Awaited<ReturnType<typeof listDomainData>>) => 
  async (): Promise<T[]> => {
    const data = await listDomainData();
    return (data[entityType] as T[]) || [];
};

const listDomainData = async (): Promise<{
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: FinancialGoal[];
  recurringPayments: RecurringPayment[];
}> => {
  if (window.electronAPI && typeof window.electronAPI['storage:list-domain-data'] === 'function') {
    const result = await window.electronAPI['storage:list-domain-data']();
    if (result.success) {
      return {
        transactions: result.transactions || [],
        categories: result.categories || [],
        budgets: result.budgets || [],
        goals: result.goals || [],
        recurringPayments: result.recurringPayments || [],
      };
    } else {
      console.error('Failed to list domain data:', result.error);
    }
  }
  return { transactions: [], categories: [], budgets: [], goals: [], recurringPayments: [] };
};


// API для транзакций
export const transactionsApi = {
  getAll: getAllFactory<Transaction>('transactions'),
  create: (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => callIPC('storage:create-entity', 'transaction', transaction),
  update: (id: string, updates: Partial<Transaction>): Promise<Transaction> => callIPC('storage:update-entity', 'transaction', id, updates),
  delete: (id: string): Promise<void> => callIPC('storage:delete-entity', 'transaction', id),
};

// API для категорий
export const categoriesApi = {
  getAll: getAllFactory<Category>('categories'),
  create: (category: Omit<Category, 'id'>): Promise<Category> => callIPC('storage:create-entity', 'category', category),
  update: (id: string, updates: Partial<Category>): Promise<Category> => callIPC('storage:update-entity', 'category', id, updates),
  delete: (id: string): Promise<void> => callIPC('storage:delete-entity', 'category', id),
};

// API для бюджетов
export const budgetsApi = {
  getAll: getAllFactory<Budget>('budgets'),
  create: (budget: Omit<Budget, 'id'>): Promise<Budget> => callIPC('storage:create-entity', 'budget', budget),
  update: (id: string, updates: Partial<Budget>): Promise<Budget> => callIPC('storage:update-entity', 'budget', id, updates),
  delete: (id: string): Promise<void> => callIPC('storage:delete-entity', 'budget', id),
};

// API для финансовых целей
export const goalsApi = {
  getAll: getAllFactory<FinancialGoal>('goals'),
  create: (goal: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> => callIPC('storage:create-entity', 'goal', goal),
  update: (id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> => callIPC('storage:update-entity', 'goal', id, updates),
  delete: (id: string): Promise<void> => callIPC('storage:delete-entity', 'goal', id),
};

// API для регулярных платежей
export const recurringPaymentsApi = {
  getAll: getAllFactory<RecurringPayment>('recurringPayments'),
  create: (payment: Omit<RecurringPayment, 'id'>): Promise<RecurringPayment> => callIPC('storage:create-entity', 'recurringPayment', payment),
  update: (id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment> => callIPC('storage:update-entity', 'recurringPayment', id, updates),
  delete: (id: string): Promise<void> => callIPC('storage:delete-entity', 'recurringPayment', id),
};

// Dummy auth functions, not used in desktop mode but kept for API compatibility
export const setAuthToken = (token: string | null) => {
  // In desktop mode, auth is not handled via tokens.
  console.log('setAuthToken called, but not used in desktop SQLite mode. Token:', token ? 'present' : 'null');
};

export const initApiWithAuth = (token: string) => {
  console.log('initApiWithAuth called, but not used in desktop SQLite mode.');
  return {};
};

export default {
  transactionsApi,
  categoriesApi,
  budgetsApi,
  goalsApi,
  recurringPaymentsApi,
  setAuthToken,
  initApiWithAuth,
};

// Extend the Window interface to include the electronAPI
declare global {
  interface Window {
    electronAPI?: {
      [key: string]: (...args: any[]) => Promise<any>;
    };
  }
}