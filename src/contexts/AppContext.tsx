import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Transaction, Category, Budget, FinancialGoal, RecurringPayment, FilterOptions } from '../types';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useFirebaseSync } from '../hooks/useFirebaseSync';

// --- CONTEXT TYPE ---
interface AppContextType {
  state: AppState;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
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
  isOnline: boolean;
}

// --- ACTIONS ---
type AppAction = 
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'SET_GOALS'; payload: FinancialGoal[] }
  | { type: 'SET_RECURRING_PAYMENTS'; payload: RecurringPayment[] }
  | { type: 'SET_FILTERS'; payload: Partial<FilterOptions> }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_SELECTED_DATE'; payload: string | null }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> };

const STORAGE_KEY = 'financeAppSettings';

// --- INITIAL STATE ---
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

// --- LOCAL STORAGE (for settings only) ---
const saveToStorage = (state: AppState) => {
  try {
    const settings = { darkMode: state.darkMode };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Storage error:', error);
  }
};

const loadFromStorage = (): Partial<AppState> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('Load error:', error);
  }
  return {};
};

// --- REDUCER ---
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return { ...state, ...action.payload };

    // Real-time data updates from Firebase
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload.length > 0 ? action.payload : state.categories };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    case 'SET_RECURRING_PAYMENTS':
      return { ...state, recurringPayments: action.payload };

    // Local UI state updates
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'TOGGLE_DARK_MODE': {
      const newState = { ...state, darkMode: !state.darkMode };
      saveToStorage(newState); // Save settings change
      return newState;
    }
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };

    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- PROVIDER ---
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, getDefaultState());
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  const { user } = useFirebaseAuth();
  const firebaseSync = useFirebaseSync();

  // --- EFFECTS ---

  // Online status
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

  // Hydrate non-data state (like darkMode) from localStorage
  useEffect(() => {
    const storedState = loadFromStorage();
    dispatch({ type: 'HYDRATE_STATE', payload: { ...getDefaultState(), ...storedState } });
    setIsHydrated(true);
  }, []);

  // Connect Firebase real-time listeners to the app state
  useEffect(() => {
    if (user && isOnline) {
      firebaseSync.setTransactionsUpdateCallback(items => dispatch({ type: 'SET_TRANSACTIONS', payload: items }));
      firebaseSync.setCategoriesUpdateCallback(items => dispatch({ type: 'SET_CATEGORIES', payload: items }));
      firebaseSync.setBudgetsUpdateCallback(items => dispatch({ type: 'SET_BUDGETS', payload: items }));
      firebaseSync.setGoalsUpdateCallback(items => dispatch({ type: 'SET_GOALS', payload: items }));
      firebaseSync.setRecurringPaymentsUpdateCallback(items => dispatch({ type: 'SET_RECURRING_PAYMENTS', payload: items }));
    }
  }, [user, isOnline, firebaseSync]);

  // --- ACTION HANDLERS (API) ---
  // These functions now only write to Firebase. The UI will update via the real-time listeners.
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => firebaseSync.addTransaction(transaction);
  const updateTransaction = (id: string, updates: Partial<Transaction>) => firebaseSync.updateTransaction(id, updates);
  const deleteTransaction = (id: string) => firebaseSync.deleteTransaction(id);

  const addCategory = (category: Omit<Category, 'id'>) => firebaseSync.addCategory(category);
  const updateCategory = (id: string, updates: Partial<Category>) => firebaseSync.updateCategory(id, updates);
  const deleteCategory = (id: string) => firebaseSync.deleteCategory(id);

  const addBudget = (budget: Omit<Budget, 'id'>) => firebaseSync.addBudget(budget);
  const updateBudget = (id: string, updates: Partial<Budget>) => firebaseSync.updateBudget(id, updates);
  const deleteBudget = (id: string) => firebaseSync.deleteBudget(id);

  const addGoal = (goal: Omit<FinancialGoal, 'id'>) => firebaseSync.addGoal(goal);
  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => firebaseSync.updateGoal(id, updates);
  const deleteGoal = (id: string) => firebaseSync.deleteGoal(id);

  const addRecurringPayment = (payment: Omit<RecurringPayment, 'id'>) => firebaseSync.addRecurringPayment(payment);
  const updateRecurringPayment = (id: string, updates: Partial<RecurringPayment>) => firebaseSync.updateRecurringPayment(id, updates);
  const deleteRecurringPayment = (id: string) => firebaseSync.deleteRecurringPayment(id);

  // Local state actions
  const setFilters = (filters: Partial<FilterOptions>) => dispatch({ type: 'SET_FILTERS', payload: filters });
  const toggleDarkMode = () => dispatch({ type: 'TOGGLE_DARK_MODE' });
  const setSelectedDate = (date: string | null) => dispatch({ type: 'SET_SELECTED_DATE', payload: date });

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
      addBudget,
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