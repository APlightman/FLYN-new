import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  AppState,
  Transaction,
  Category,
  Budget,
  FinancialGoal,
  RecurringPayment,
  FilterOptions,
} from "../types";
import {
  createDesktopEntity,
  deleteDesktopEntity,
  loadDesktopAppState,
  loadDesktopDomainData,
  saveDesktopAppState,
  updateDesktopEntity,
} from "../lib/desktopStorage";

// --- CONTEXT TYPE ---
interface AppContextType {
  state: AppState;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, "id">) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (goal: Omit<FinancialGoal, "id">) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
  addRecurringPayment: (payment: Omit<RecurringPayment, "id">) => void;
  updateRecurringPayment: (
    id: string,
    payment: Partial<RecurringPayment>,
  ) => void;
  deleteRecurringPayment: (id: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  toggleDarkMode: () => void;
  setSelectedDate: (date: string | null) => void;
  isOnline: boolean;
}

// --- ACTIONS ---
type AppAction =
  | { type: "HYDRATE_STATE"; payload: AppState }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | {
      type: "UPDATE_TRANSACTION";
      payload: { id: string; updates: Partial<Transaction> };
    }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Category }
  | {
      type: "UPDATE_CATEGORY";
      payload: { id: string; updates: Partial<Category> };
    }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "ADD_BUDGET"; payload: Budget }
  | { type: "UPDATE_BUDGET"; payload: { id: string; updates: Partial<Budget> } }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "ADD_GOAL"; payload: FinancialGoal }
  | {
      type: "UPDATE_GOAL";
      payload: { id: string; updates: Partial<FinancialGoal> };
    }
  | { type: "DELETE_GOAL"; payload: string }
  | { type: "ADD_RECURRING_PAYMENT"; payload: RecurringPayment }
  | {
      type: "UPDATE_RECURRING_PAYMENT";
      payload: { id: string; updates: Partial<RecurringPayment> };
    }
  | { type: "DELETE_RECURRING_PAYMENT"; payload: string }
  | { type: "SET_FILTERS"; payload: Partial<FilterOptions> }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "SET_SELECTED_DATE"; payload: string | null };

// --- INITIAL STATE ---
const getDefaultCategories = (): Category[] => [
  // Расходы
  { id: "1", name: "Продукты", type: "expense", color: "#ef4444" },
  { id: "2", name: "Транспорт", type: "expense", color: "#f97316" },
  { id: "3", name: "Развлечения", type: "expense", color: "#eab308" },
  { id: "4", name: "Коммунальные услуги", type: "expense", color: "#06b6d4" },
  { id: "5", name: "Здоровье", type: "expense", color: "#8b5cf6" },
  { id: "9", name: "Кафе и рестораны", type: "expense", color: "#ec4899" },
  { id: "10", name: "Одежда", type: "expense", color: "#a855f7" },
  { id: "11", name: "Связь и интернет", type: "expense", color: "#14b8a6" },
  { id: "12", name: "Жильё (аренда/ипотека)", type: "expense", color: "#0ea5e9" },
  { id: "13", name: "Страхование", type: "expense", color: "#6366f1" },
  { id: "14", name: "Образование", type: "expense", color: "#d946ef" },
  { id: "15", name: "Подарки", type: "expense", color: "#f43f5e" },
  { id: "16", name: "Дом и ремонт", type: "expense", color: "#78716c" },
  { id: "17", name: "Дети", type: "expense", color: "#fb923c" },
  { id: "18", name: "Животные", type: "expense", color: "#a3e635" },
  // Доходы
  { id: "6", name: "Зарплата", type: "income", color: "#22c55e" },
  { id: "7", name: "Подработка", type: "income", color: "#10b981" },
  { id: "8", name: "Инвестиции", type: "income", color: "#3b82f6" },
  { id: "19", name: "Кешбэк", type: "income", color: "#2dd4bf" },
  { id: "20", name: "Аренда", type: "income", color: "#a78bfa" },
];

const getDefaultState = (): AppState => ({
  transactions: [],
  categories: getDefaultCategories(),
  budgets: [],
  goals: [],
  recurringPayments: [],
  filters: {
    dateRange: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    categories: [],
  },
  darkMode: false,
  selectedDate: null,
});

const createEntityId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const normalizeBudget = (budget: Budget): Budget => ({
  ...budget,
  spent: budget.spent ?? 0,
  remaining: budget.remaining ?? budget.amount - (budget.spent ?? 0),
});

const normalizeState = (state: Partial<AppState>): AppState => {
  const defaultState = getDefaultState();

  return {
    ...defaultState,
    ...state,
    transactions: Array.isArray(state.transactions)
      ? state.transactions
      : defaultState.transactions,
    categories: Array.isArray(state.categories)
      ? state.categories
      : defaultState.categories,
    budgets: Array.isArray(state.budgets)
      ? state.budgets.map(normalizeBudget)
      : defaultState.budgets,
    goals: Array.isArray(state.goals) ? state.goals : defaultState.goals,
    recurringPayments: Array.isArray(state.recurringPayments)
      ? state.recurringPayments
      : defaultState.recurringPayments,
    filters: {
      ...defaultState.filters,
      ...state.filters,
      dateRange: {
        ...defaultState.filters.dateRange,
        ...state.filters?.dateRange,
      },
      categories: Array.isArray(state.filters?.categories)
        ? state.filters.categories
        : defaultState.filters.categories,
    },
    darkMode:
      typeof state.darkMode === "boolean"
        ? state.darkMode
        : defaultState.darkMode,
    selectedDate: state.selectedDate ?? defaultState.selectedDate,
  };
};

// --- REDUCER ---
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "HYDRATE_STATE":
      return action.payload;

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload.updates }
            : transaction,
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.payload,
        ),
      };

    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "UPDATE_CATEGORY": {
      const currentCategory = state.categories.find(
        (category) => category.id === action.payload.id,
      );
      if (!currentCategory) {
        return state;
      }

      const nextName =
        action.payload.updates.name?.trim() || currentCategory.name;
      const hasNameChanged = nextName !== currentCategory.name;

      return {
        ...state,
        categories: state.categories.map((category) =>
          category.id === action.payload.id
            ? { ...category, ...action.payload.updates, name: nextName }
            : category,
        ),
        transactions: hasNameChanged
          ? state.transactions.map((transaction) =>
              transaction.category === currentCategory.name
                ? { ...transaction, category: nextName }
                : transaction,
            )
          : state.transactions,
        recurringPayments: hasNameChanged
          ? state.recurringPayments.map((payment) =>
              payment.category === currentCategory.name
                ? { ...payment, category: nextName }
                : payment,
            )
          : state.recurringPayments,
      };
    }
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories
          .filter((category) => category.id !== action.payload)
          .map((category) =>
            category.parent === action.payload
              ? { ...category, parent: undefined }
              : category,
          ),
        budgets: state.budgets.filter(
          (budget) => budget.categoryId !== action.payload,
        ),
      };

    case "ADD_BUDGET":
      return {
        ...state,
        budgets: [...state.budgets, normalizeBudget(action.payload)],
      };
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.payload.id
            ? normalizeBudget({ ...budget, ...action.payload.updates })
            : budget,
        ),
      };
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.payload),
      };

    case "ADD_GOAL":
      return { ...state, goals: [...state.goals, action.payload] };
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.payload.id
            ? { ...goal, ...action.payload.updates }
            : goal,
        ),
      };
    case "DELETE_GOAL":
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.payload),
      };

    case "ADD_RECURRING_PAYMENT":
      return {
        ...state,
        recurringPayments: [...state.recurringPayments, action.payload],
      };
    case "UPDATE_RECURRING_PAYMENT":
      return {
        ...state,
        recurringPayments: state.recurringPayments.map((payment) =>
          payment.id === action.payload.id
            ? { ...payment, ...action.payload.updates }
            : payment,
        ),
      };
    case "DELETE_RECURRING_PAYMENT":
      return {
        ...state,
        recurringPayments: state.recurringPayments.filter(
          (payment) => payment.id !== action.payload,
        ),
      };

    // Local UI state updates
    case "SET_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
          dateRange: {
            ...state.filters.dateRange,
            ...action.payload.dateRange,
          },
        },
      };
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };
    case "SET_SELECTED_DATE":
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
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  // --- EFFECTS ---

  // Online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Hydrate local state from storage
  useEffect(() => {
    let isMounted = true;

    const hydrateState = async () => {
      // Загружаем UI состояние из app_state (или localStorage fallback)
      const appStateResult = await loadDesktopAppState();

      if (!isMounted) {
        return;
      }

      if (appStateResult.error) {
        console.warn("Storage hydrate fallback:", appStateResult.error);
      }

      const uiState = normalizeState(appStateResult.state ?? getDefaultState());

      // Загружаем domain данные из отдельных таблиц
      const domainResult = await loadDesktopDomainData();

      // Создаём объединённое состояние:
      // - Domain данные берём из domainResult (если есть)
      // - UI состояние (filters, darkMode, selectedDate) берём из uiState
      // - Если domain данных нет, используем дефолтные значения (пустые массивы)
      const mergedState = normalizeState({
        // UI состояние
        filters: uiState.filters,
        darkMode: uiState.darkMode,
        selectedDate: uiState.selectedDate,

        // Domain данные (приоритет: domainResult > дефолтные пустые массивы)
        transactions: domainResult?.success
          ? (domainResult.transactions ?? [])
          : [],
        categories: domainResult?.success
          ? (domainResult.categories ?? [])
          : [],
        budgets: domainResult?.success ? (domainResult.budgets ?? []) : [],
        goals: domainResult?.success ? (domainResult.goals ?? []) : [],
        recurringPayments: domainResult?.success
          ? (domainResult.recurringPayments ?? [])
          : [],
      });

      dispatch({
        type: "HYDRATE_STATE",
        payload: mergedState,
      });
      setIsHydrated(true);
    };

    hydrateState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      void saveDesktopAppState(state).then((result) => {
        if (result.error) {
          console.warn("Storage save fallback:", result.error);
        }
      });
    }
  }, [state, isHydrated]);

  // --- ACTION HANDLERS ---
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const payload = {
      ...(transaction as Transaction),
      id: (transaction as Partial<Transaction>).id ?? createEntityId(),
    };

    dispatch({
      type: "ADD_TRANSACTION",
      payload,
    });

    void createDesktopEntity("transaction", payload);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    dispatch({ type: "UPDATE_TRANSACTION", payload: { id, updates } });
    void updateDesktopEntity("transaction", id, updates);
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
    void deleteDesktopEntity("transaction", id);
  };

  const addCategory = (category: Omit<Category, "id">) => {
    const payload = {
      ...(category as Category),
      id: (category as Partial<Category>).id ?? createEntityId(),
    };

    dispatch({
      type: "ADD_CATEGORY",
      payload,
    });

    void createDesktopEntity("category", payload);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const currentCategory = state.categories.find(
      (category) => category.id === id,
    );
    const nextName = updates.name?.trim() || currentCategory?.name;

    dispatch({ type: "UPDATE_CATEGORY", payload: { id, updates } });
    void updateDesktopEntity("category", id, updates);

    if (currentCategory && nextName && nextName !== currentCategory.name) {
      state.transactions
        .filter((transaction) => transaction.category === currentCategory.name)
        .forEach((transaction) => {
          void updateDesktopEntity("transaction", transaction.id, {
            category: nextName,
          });
        });

      state.recurringPayments
        .filter((payment) => payment.category === currentCategory.name)
        .forEach((payment) => {
          void updateDesktopEntity("recurringPayment", payment.id, {
            category: nextName,
          });
        });
    }
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: "DELETE_CATEGORY", payload: id });
    void deleteDesktopEntity("category", id);
  };

  const addBudget = (budget: Omit<Budget, "id">) => {
    const payload = normalizeBudget({
      ...(budget as Budget),
      id: (budget as Partial<Budget>).id ?? createEntityId(),
    });

    dispatch({
      type: "ADD_BUDGET",
      payload,
    });

    void createDesktopEntity("budget", payload);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    const currentBudget = state.budgets.find((budget) => budget.id === id);
    const normalizedUpdates = currentBudget
      ? normalizeBudget({
          ...currentBudget,
          ...updates,
        })
      : updates;

    dispatch({
      type: "UPDATE_BUDGET",
      payload: { id, updates: normalizedUpdates },
    });
    void updateDesktopEntity("budget", id, normalizedUpdates);
  };

  const deleteBudget = (id: string) => {
    dispatch({ type: "DELETE_BUDGET", payload: id });
    void deleteDesktopEntity("budget", id);
  };

  const addGoal = (goal: Omit<FinancialGoal, "id">) => {
    const payload = {
      ...(goal as FinancialGoal),
      id: (goal as Partial<FinancialGoal>).id ?? createEntityId(),
    };

    dispatch({
      type: "ADD_GOAL",
      payload,
    });

    void createDesktopEntity("goal", payload);
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    dispatch({ type: "UPDATE_GOAL", payload: { id, updates } });
    void updateDesktopEntity("goal", id, updates);
  };

  const deleteGoal = (id: string) => {
    dispatch({ type: "DELETE_GOAL", payload: id });
    void deleteDesktopEntity("goal", id);
  };

  const addRecurringPayment = (payment: Omit<RecurringPayment, "id">) => {
    const payload = {
      ...(payment as RecurringPayment),
      id: (payment as Partial<RecurringPayment>).id ?? createEntityId(),
    };

    dispatch({
      type: "ADD_RECURRING_PAYMENT",
      payload,
    });

    void createDesktopEntity("recurringPayment", payload);
  };

  const updateRecurringPayment = (
    id: string,
    updates: Partial<RecurringPayment>,
  ) => {
    dispatch({ type: "UPDATE_RECURRING_PAYMENT", payload: { id, updates } });
    void updateDesktopEntity("recurringPayment", id, updates);
  };

  const deleteRecurringPayment = (id: string) => {
    dispatch({ type: "DELETE_RECURRING_PAYMENT", payload: id });
    void deleteDesktopEntity("recurringPayment", id);
  };

  // Local state actions
  const setFilters = (filters: Partial<FilterOptions>) =>
    dispatch({ type: "SET_FILTERS", payload: filters });
  const toggleDarkMode = () => dispatch({ type: "TOGGLE_DARK_MODE" });
  const setSelectedDate = (date: string | null) =>
    dispatch({ type: "SET_SELECTED_DATE", payload: date });

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
    <AppContext.Provider
      value={{
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
        isOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
