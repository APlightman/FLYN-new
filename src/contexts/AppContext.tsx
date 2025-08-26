import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Transaction, Category, Budget, FinancialGoal, RecurringPayment, FilterOptions, generateId } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useSupabaseSync } from '../hooks/useSupabaseSync';

interface AppContextType {
  state: AppState;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setBudget: (budget: Budget) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id'>) => void;
  updateRecurringPayment: (id: string, payment: Partial<RecurringPayment>) => void;
  deleteRecurringPayment: (id: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  toggleDarkMode: () => void;
  setSelectedDate: (date: string | null) => void;
  syncData: () => Promise<void>;
  isOnline: boolean;
}

type AppAction = 
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: { id: string; updates: Partial<Budget> } }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_GOAL'; payload: FinancialGoal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: Partial<FinancialGoal> } }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_RECURRING_PAYMENT'; payload: RecurringPayment }
  | { type: 'UPDATE_RECURRING_PAYMENT'; payload: { id: string; updates: Partial<RecurringPayment> } }
  | { type: 'DELETE_RECURRING_PAYMENT'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<FilterOptions> }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_SELECTED_DATE'; payload: string | null }
  | { type: 'SYNC_DATA'; payload: Partial<AppState> }
  | { type: 'HYDRATE_STATE'; payload: AppState };

const STORAGE_KEY = 'financeAppState';

const getDefaultCategories = (): Category[] => [
  { id: '1', name: 'Продукты', type: 'expense', color: '#ef4444' },
  { id: '2', name: 'Транспорт', type: 'expense', color: '#f97316' },
  { id: '3', name: 'Развлечения', type: 'expense', color: '#eab308' },
  { id: '4', name: 'Коммунальные услуги', type: 'expense', color: '#06b6d4' },
  { id: '5', name: 'Здоровье', type: 'expense', color: '#8b5cf6' },
  { id: '6', name: 'Зарплата', type: 'income', color: '#22c55e' },
  { id: '7', name: 'Подработка', type: 'income', color: '#10b981' },
  { id: '8', name: 'Инвестиции', type: 'income', color: '#3b82f6' },
];

const getDefaultState = (): AppState => ({
  transactions: [],
  categories: getDefaultCategories(),
  budgets: [],
  goals: [],
  recurringPayments: [],
  filters: {
    dateRange: { 
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    categories: [],
  },
  darkMode: false,
  selectedDate: null,
});

const saveToStorage = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Storage error:', error);
  }
};

const loadFromStorage = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...getDefaultState(),
        ...parsed,
        categories: parsed.categories?.length ? parsed.categories : getDefaultCategories(),
      };
    }
  } catch (error) {
    console.error('Load error:', error);
  }
  return getDefaultState();
};

function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;
  switch (action.type) {
    case 'HYDRATE_STATE':
      return action.payload;
    case 'SYNC_DATA':
      newState = { ...state, ...action.payload };
      break;
    case 'ADD_TRANSACTION':
      newState = { ...state, transactions: [...state.transactions, action.payload] };
      break;
    case 'UPDATE_TRANSACTION':
      newState = {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
      break;
    case 'DELETE_TRANSACTION':
      newState = { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
      break;
    case 'ADD_CATEGORY':
      newState = { ...state, categories: [...state.categories, action.payload] };
      break;
    case 'UPDATE_CATEGORY':
      newState = {
        ...state,
        categories: state.categories.map(c => 
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };
      break;
    case 'DELETE_CATEGORY':
      newState = { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
      break;
    case 'SET_BUDGET':
      newState = {
        ...state,
        budgets: [...state.budgets.filter(b => b.categoryId !== action.payload.categoryId), action.payload],
      };
      break;
    case 'UPDATE_BUDGET':
      newState = {
        ...state,
        budgets: state.budgets.map(b => 
          b.id === action.payload.id ? { ...b, ...action.payload.updates } : b
        ),
      };
      break;
    case 'DELETE_BUDGET':
      newState = { ...state, budgets: state.budgets.filter(b => b.id !== action.payload) };
      break;
    case 'ADD_GOAL':
      newState = { ...state, goals: [...state.goals, action.payload] };
      break;
    case 'UPDATE_GOAL':
      newState = {
        ...state,
        goals: state.goals.map(g => 
          g.id === action.payload.id ? { ...g, ...action.payload.updates } : g
        ),
      };
      break;
    case 'DELETE_GOAL':
      newState = { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
      break;
    case 'ADD_RECURRING_PAYMENT':
      newState = { ...state, recurringPayments: [...state.recurringPayments, action.payload] };
      break;
    case 'UPDATE_RECURRING_PAYMENT':
      newState = {
        ...state,
        recurringPayments: state.recurringPayments.map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };
      break;
    case 'DELETE_RECURRING_PAYMENT':
      newState = { ...state, recurringPayments: state.recurringPayments.filter(p => p.id !== action.payload) };
      break;
    case 'SET_FILTERS':
      newState = { ...state, filters: { ...state.filters, ...action.payload } };
      break;
    case 'TOGGLE_DARK_MODE':
      newState = { ...state, darkMode: !state.darkMode };
      break;
    case 'SET_SELECTED_DATE':
      newState = { ...state, selectedDate: action.payload };
      break;
    default:
      return state;
  }
  saveToStorage(newState);
  return newState;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, getDefaultState());
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  const { user } = useAuth();
  const {
    syncTransactions,
    syncCategories,
    syncBudgets,
    syncGoals,
    syncRecurringPayments,
    addTransaction: addTransactionToSupabase,
    updateTransaction: updateTransactionInSupabase,
    deleteTransaction: deleteTransactionFromSupabase,
    addCategory: addCategoryToSupabase,
    updateCategory: updateCategoryInSupabase,
    deleteCategory: deleteCategoryFromSupabase,
    addBudget: addBudgetToSupabase,
    updateBudget: updateBudgetInSupabase,
    deleteBudget: deleteBudgetFromSupabase,
    addGoal: addGoalToSupabase,
    updateGoal: updateGoalInSupabase,
    deleteGoal: deleteGoalFromSupabase,
    addRecurringPayment: addRecurringPaymentToSupabase,
    updateRecurringPayment: updateRecurringPaymentInSupabase,
    deleteRecurringPayment: deleteRecurringPaymentFromSupabase
  } = useSupabaseSync();

  // Отслеживание онлайн статуса
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Гидратация состояния - исправлена логика
  useEffect(() => {
    try {
      const hydratedState = loadFromStorage();
      dispatch({ type: 'HYDRATE_STATE', payload: hydratedState });
    } catch (error) {
      console.error('Hydration error:', error);
      // В случае ошибки используем состояние по умолчанию
      dispatch({ type: 'HYDRATE_STATE', payload: getDefaultState() });
    } finally {
      // Всегда завершаем загрузку
      setIsHydrated(true);
    }
  }, []);

  // Синхронизация при входе пользователя
  useEffect(() => {
    if (user && isOnline && isHydrated) {
      syncData().catch(error => {
        console.error('Sync error:', error);
        // Не блокируем приложение при ошибке синхронизации
      });
    }
  }, [user, isOnline, isHydrated]);

  const syncData = async () => {
    if (!user || !isOnline) return;

    try {
      const [
        syncedTransactions,
        syncedCategories,
        syncedBudgets,
        syncedGoals,
        syncedRecurringPayments
      ] = await Promise.all([
        syncTransactions(state.transactions),
        syncCategories(state.categories),
        syncBudgets(state.budgets),
        syncGoals(state.goals),
        syncRecurringPayments(state.recurringPayments)
      ]);

      dispatch({
        type: 'SYNC_DATA',
        payload: {
          transactions: syncedTransactions,
          categories: syncedCategories,
          budgets: syncedBudgets,
          goals: syncedGoals,
          recurringPayments: syncedRecurringPayments
        }
      });
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: generateId() };
    
    // Добавляем локально
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await addTransactionToSupabase(transaction);
      } catch (error) {
        console.error('Failed to sync transaction:', error);
      }
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    // Обновляем локально
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await updateTransactionInSupabase(id, updates);
      } catch (error) {
        console.error('Failed to sync transaction update:', error);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    // Удаляем локально
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await deleteTransactionFromSupabase(id);
      } catch (error) {
        console.error('Failed to sync transaction deletion:', error);
      }
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: generateId() };
    
    // Добавляем локально
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await addCategoryToSupabase(category);
      } catch (error) {
        console.error('Failed to sync category:', error);
      }
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    // Обновляем локально
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await updateCategoryInSupabase(id, updates);
      } catch (error) {
        console.error('Failed to sync category update:', error);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    // Удаляем локально
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await deleteCategoryFromSupabase(id);
      } catch (error) {
        console.error('Failed to sync category deletion:', error);
      }
    }
  };

  const setBudget = async (budget: Budget) => {
    // Добавляем локально
    dispatch({ type: 'SET_BUDGET', payload: budget });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await addBudgetToSupabase(budget);
      } catch (error) {
        console.error('Failed to sync budget:', error);
      }
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    // Обновляем локально
    dispatch({ type: 'UPDATE_BUDGET', payload: { id, updates } });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await updateBudgetInSupabase(id, updates);
      } catch (error) {
        console.error('Failed to sync budget update:', error);
      }
    }
  };

  const deleteBudget = async (id: string) => {
    // Удаляем локально
    dispatch({ type: 'DELETE_BUDGET', payload: id });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await deleteBudgetFromSupabase(id);
      } catch (error) {
        console.error('Failed to sync budget deletion:', error);
      }
    }
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id'>) => {
    const newGoal = { ...goal, id: generateId() };
    
    // Добавляем локально
    dispatch({ type: 'ADD_GOAL', payload: newGoal });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await addGoalToSupabase(goal);
      } catch (error) {
        console.error('Failed to sync goal:', error);
      }
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    // Обновляем локально
    dispatch({ type: 'UPDATE_GOAL', payload: { id, updates } });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await updateGoalInSupabase(id, updates);
      } catch (error) {
        console.error('Failed to sync goal update:', error);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    // Удаляем локально
    dispatch({ type: 'DELETE_GOAL', payload: id });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await deleteGoalFromSupabase(id);
      } catch (error) {
        console.error('Failed to sync goal deletion:', error);
      }
    }
  };

  const addRecurringPayment = async (payment: Omit<RecurringPayment, 'id'>) => {
    const newPayment = { ...payment, id: generateId() };
    
    // Добавляем локально
    dispatch({ type: 'ADD_RECURRING_PAYMENT', payload: newPayment });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await addRecurringPaymentToSupabase(payment);
      } catch (error) {
        console.error('Failed to sync recurring payment:', error);
      }
    }
  };

  const updateRecurringPayment = async (id: string, updates: Partial<RecurringPayment>) => {
    // Обновляем локально
    dispatch({ type: 'UPDATE_RECURRING_PAYMENT', payload: { id, updates } });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await updateRecurringPaymentInSupabase(id, updates);
      } catch (error) {
        console.error('Failed to sync recurring payment update:', error);
      }
    }
  };

  const deleteRecurringPayment = async (id: string) => {
    // Удаляем локально
    dispatch({ type: 'DELETE_RECURRING_PAYMENT', payload: id });
    
    // Синхронизируем с сервером если онлайн
    if (user && isOnline) {
      try {
        await deleteRecurringPaymentFromSupabase(id);
      } catch (error) {
        console.error('Failed to sync recurring payment deletion:', error);
      }
    }
  };

  const setFilters = (filters: Partial<FilterOptions>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const setSelectedDate = (date: string | null) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  };

  // Показываем загрузку только если состояние не гидратировано
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      setBudget,
      updateBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      addRecurringPayment,
      updateRecurringPayment,
      deleteRecurringPayment,
      setFilters,
      toggleDarkMode,
      setSelectedDate,
      syncData,
      isOnline
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
