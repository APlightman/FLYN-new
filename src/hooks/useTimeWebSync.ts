import { useState, useCallback, useEffect } from 'react';
import { 
  Transaction, 
  Category, 
  Budget, 
  FinancialGoal, 
  RecurringPayment 
} from '../types';
import * as timeWebApi from '../lib/timeWebApi';
import { useFirebaseAuth } from './useFirebaseAuth';

// --- STATE AND CONFIG INTERFACES ---
interface SyncState {
  syncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

interface SyncOptions {
  syncTransactions?: boolean;
  syncCategories?: boolean;
  syncBudgets?: boolean;
  syncGoals?: boolean;
  syncRecurringPayments?: boolean;
  // Интервал синхронизации в миллисекундах (по умолчанию 30 секунд)
  syncInterval?: number;
}

// --- MAIN HOOK ---
export function useTimeWebSync(syncOptions: SyncOptions = {}) {
  const { user, isFirebaseEnabled } = useFirebaseAuth();
  const [syncState, setSyncState] = useState<SyncState>({
    syncing: false,
    lastSync: null,
    error: null
  });
  
  // --- REAL-TIME UPDATE CALLBACKS ---
  const [onTransactionsUpdate, setOnTransactionsUpdate] = useState<(items: Transaction[]) => void>(() => () => {});
  const [onCategoriesUpdate, setOnCategoriesUpdate] = useState<(items: Category[]) => void>(() => () => {});
  const [onBudgetsUpdate, setOnBudgetsUpdate] = useState<(items: Budget[]) => void>(() => () => {});
  const [onGoalsUpdate, setOnGoalsUpdate] = useState<(items: FinancialGoal[]) => void>(() => () => {});
  const [onRecurringPaymentsUpdate, setOnRecurringPaymentsUpdate] = useState<(items: RecurringPayment[]) => void>(() => () => {});

  const isAvailable = isFirebaseEnabled && user;
  
  // --- SYNC INTERVAL EFFECT ---
  useEffect(() => {
    if (!isAvailable) {
      return;
    }
    
    // Инициализируем API с токеном аутентификации Firebase
    const idToken = user && user.getIdToken ? user.getIdToken() : Promise.resolve(null);
    
    idToken.then(token => {
      if (token) {
        timeWebApi.setAuthToken(token);
      }
    });
    
    // Устанавливаем интервал синхронизации
    const interval = setInterval(() => {
      syncAllData();
    }, syncOptions.syncInterval || 30000); // По умолчанию 30 секунд
    
    // Выполняем первую синхронизацию сразу
    syncAllData();
    
    return () => {
      clearInterval(interval);
    };
  }, [isAvailable, user, syncOptions.syncInterval]);
  
  // --- DATA SYNC FUNCTION ---
  const syncAllData = useCallback(async () => {
    if (!isAvailable || !user) {
      return;
    }
    
    setSyncState(prev => ({ ...prev, syncing: true, error: null }));
    
    try {
      // Синхронизируем только выбранные типы данных
      const promises = [];
      
      if (syncOptions.syncTransactions !== false) {
        promises.push(
          timeWebApi.transactionsApi.getAll(user.uid)
            .then(onTransactionsUpdate)
            .catch(error => {
              console.error('Transactions sync error:', error);
              throw new Error(`Ошибка синхронизации транзакций: ${error.message}`);
            })
        );
      }
      
      if (syncOptions.syncCategories !== false) {
        promises.push(
          timeWebApi.categoriesApi.getAll(user.uid)
            .then(onCategoriesUpdate)
            .catch(error => {
              console.error('Categories sync error:', error);
              throw new Error(`Ошибка синхронизации категорий: ${error.message}`);
            })
        );
      }
      
      if (syncOptions.syncBudgets !== false) {
        promises.push(
          timeWebApi.budgetsApi.getAll(user.uid)
            .then(onBudgetsUpdate)
            .catch(error => {
              console.error('Budgets sync error:', error);
              throw new Error(`Ошибка синхронизации бюджетов: ${error.message}`);
            })
        );
      }
      
      if (syncOptions.syncGoals !== false) {
        promises.push(
          timeWebApi.goalsApi.getAll(user.uid)
            .then(onGoalsUpdate)
            .catch(error => {
              console.error('Goals sync error:', error);
              throw new Error(`Ошибка синхронизации целей: ${error.message}`);
            })
        );
      }
      
      if (syncOptions.syncRecurringPayments !== false) {
        promises.push(
          timeWebApi.recurringPaymentsApi.getAll(user.uid)
            .then(onRecurringPaymentsUpdate)
            .catch(error => {
              console.error('Recurring payments sync error:', error);
              throw new Error(`Ошибка синхронизации регулярных платежей: ${error.message}`);
            })
        );
      }
      
      await Promise.all(promises);
      
      setSyncState(prev => ({ 
        ...prev, 
        syncing: false, 
        lastSync: new Date(), 
        error: null 
      }));
    } catch (error: unknown) {
      console.error('Sync error:', error);
      setSyncState(prev => ({ 
        ...prev, 
        syncing: false, 
        error: error instanceof Error ? error.message : 'Ошибка синхронизации данных' 
      }));
    }
  }, [
    isAvailable, 
    user, 
    onTransactionsUpdate, 
    onCategoriesUpdate, 
    onBudgetsUpdate, 
    onGoalsUpdate, 
    onRecurringPaymentsUpdate,
    syncOptions.syncTransactions,
    syncOptions.syncCategories,
    syncOptions.syncBudgets,
    syncOptions.syncGoals,
    syncOptions.syncRecurringPayments
  ]);
  
  // --- CALLBACK SETTERS ---
  const setTransactionsUpdateCallback = useCallback((cb: (items: Transaction[]) => void) => setOnTransactionsUpdate(() => cb), []);
  const setCategoriesUpdateCallback = useCallback((cb: (items: Category[]) => void) => setOnCategoriesUpdate(() => cb), []);
  const setBudgetsUpdateCallback = useCallback((cb: (items: Budget[]) => void) => setOnBudgetsUpdate(() => cb), []);
  const setGoalsUpdateCallback = useCallback((cb: (items: FinancialGoal[]) => void) => setOnGoalsUpdate(() => cb), []);
  const setRecurringPaymentsUpdateCallback = useCallback((cb: (items: RecurringPayment[]) => void) => setOnRecurringPaymentsUpdate(() => cb), []);

  // --- DB OPERATION WRAPPER ---
  const safeDbOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    if (!isAvailable) {
      console.warn(`${operationName}: TimeWeb API not available.`);
      setSyncState(prev => ({ ...prev, error: 'Нет подключения к базе данных' }));
      return null;
    }
    try {
      const result = await operation();
      // После каждой операции запускаем синхронизацию
      syncAllData();
      return result;
    } catch (error: unknown) {
      console.error(`${operationName} failed:`, error);
      setSyncState(prev => ({ ...prev, error: `Ошибка операции: ${error instanceof Error ? error.message : operationName}` }));
      return null;
    }
  }, [isAvailable, syncAllData]);

  // --- DATA VALIDATION ---
  const validateTransaction = (data: Omit<Transaction, 'id'>): boolean => {
    return (
      typeof data.amount === 'number' &&
      data.amount >= 0 &&
      typeof data.type === 'string' &&
      ['income', 'expense'].includes(data.type) &&
      typeof data.category === 'string' &&
      data.category.length > 0 &&
      typeof data.date === 'string' &&
      !isNaN(Date.parse(data.date))
    );
  };

  const validateCategory = (data: Omit<Category, 'id'>): boolean => {
    return (
      typeof data.name === 'string' &&
      data.name.length > 0 &&
      typeof data.type === 'string' &&
      ['income', 'expense'].includes(data.type) &&
      typeof data.color === 'string' &&
      /^#[0-9A-F]{6}$/i.test(data.color)
    );
  };

  const validateBudget = (data: Omit<Budget, 'id'>): boolean => {
    return (
      typeof data.categoryId === 'string' &&
      data.categoryId.length > 0 &&
      typeof data.amount === 'number' &&
      data.amount >= 0 &&
      typeof data.period === 'string' &&
      ['monthly', 'yearly'].includes(data.period) &&
      typeof data.spent === 'number' &&
      data.spent >= 0
    );
  };

  const validateGoal = (data: Omit<FinancialGoal, 'id'>): boolean => {
    return (
      typeof data.name === 'string' &&
      data.name.length > 0 &&
      typeof data.targetAmount === 'number' &&
      data.targetAmount > 0 &&
      typeof data.currentAmount === 'number' &&
      data.currentAmount >= 0 &&
      typeof data.deadline === 'string' &&
      !isNaN(Date.parse(data.deadline)) &&
      typeof data.monthlyContribution === 'number' &&
      data.monthlyContribution >= 0 &&
      typeof data.priority === 'string' &&
      ['low', 'medium', 'high'].includes(data.priority)
    );
  };

  const validateRecurringPayment = (data: Omit<RecurringPayment, 'id'>): boolean => {
    return (
      typeof data.name === 'string' &&
      data.name.length > 0 &&
      typeof data.amount === 'number' &&
      data.amount >= 0 &&
      typeof data.category === 'string' &&
      data.category.length > 0 &&
      typeof data.frequency === 'string' &&
      ['daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(data.frequency) &&
      typeof data.nextDate === 'string' &&
      !isNaN(Date.parse(data.nextDate)) &&
      typeof data.isActive === 'boolean'
    );
  };

  // --- CRUD FUNCTIONS ---
  const transactionCrud = {
    add: (data: Omit<Transaction, 'id'>) => {
      if (!validateTransaction(data)) {
        console.error('Validation failed for transaction:', data);
        setSyncState(prev => ({ ...prev, error: 'Ошибка валидации данных транзакции' }));
        return Promise.resolve(null);
      }
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.transactionsApi.create(data, user.uid);
      }, 'addTransaction');
    },
    update: (id: string, updates: Partial<Transaction>) => {
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.transactionsApi.update(id, updates, user.uid);
      }, 'updateTransaction');
    },
    remove: (id: string) => {
      return safeDbOperation(() => timeWebApi.transactionsApi.delete(id), 'deleteTransaction');
    },
  };

  const categoryCrud = {
    add: (data: Omit<Category, 'id'>) => {
      if (!validateCategory(data)) {
        console.error('Validation failed for category:', data);
        setSyncState(prev => ({ ...prev, error: 'Ошибка валидации данных категории' }));
        return Promise.resolve(null);
      }
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.categoriesApi.create(data, user.uid);
      }, 'addCategory');
    },
    update: (id: string, updates: Partial<Category>) => {
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.categoriesApi.update(id, updates, user.uid);
      }, 'updateCategory');
    },
    remove: (id: string) => {
      return safeDbOperation(() => timeWebApi.categoriesApi.delete(id), 'deleteCategory');
    },
  };

  const budgetCrud = {
    add: (data: Omit<Budget, 'id'>) => {
      if (!validateBudget(data)) {
        console.error('Validation failed for budget:', data);
        setSyncState(prev => ({ ...prev, error: 'Ошибка валидации данных бюджета' }));
        return Promise.resolve(null);
      }
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.budgetsApi.create(data, user.uid);
      }, 'addBudget');
    },
    update: (id: string, updates: Partial<Budget>) => {
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.budgetsApi.update(id, updates, user.uid);
      }, 'updateBudget');
    },
    remove: (id: string) => {
      return safeDbOperation(() => timeWebApi.budgetsApi.delete(id), 'deleteBudget');
    },
  };

  const goalCrud = {
    add: (data: Omit<FinancialGoal, 'id'>) => {
      if (!validateGoal(data)) {
        console.error('Validation failed for goal:', data);
        setSyncState(prev => ({ ...prev, error: 'Ошибка валидации данных цели' }));
        return Promise.resolve(null);
      }
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.goalsApi.create(data, user.uid);
      }, 'addGoal');
    },
    update: (id: string, updates: Partial<FinancialGoal>) => {
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.goalsApi.update(id, updates, user.uid);
      }, 'updateGoal');
    },
    remove: (id: string) => {
      return safeDbOperation(() => timeWebApi.goalsApi.delete(id), 'deleteGoal');
    },
  };

  const recurringPaymentCrud = {
    add: (data: Omit<RecurringPayment, 'id'>) => {
      if (!validateRecurringPayment(data)) {
        console.error('Validation failed for recurring payment:', data);
        setSyncState(prev => ({ ...prev, error: 'Ошибка валидации данных регулярного платежа' }));
        return Promise.resolve(null);
      }
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.recurringPaymentsApi.create(data, user.uid);
      }, 'addRecurringPayment');
    },
    update: (id: string, updates: Partial<RecurringPayment>) => {
      return safeDbOperation(() => {
        if (!user) throw new Error('User not available');
        return timeWebApi.recurringPaymentsApi.update(id, updates, user.uid);
      }, 'updateRecurringPayment');
    },
    remove: (id: string) => {
      return safeDbOperation(() => timeWebApi.recurringPaymentsApi.delete(id), 'deleteRecurringPayment');
    },
  };

  return {
    syncState,
    isFirebaseAvailable: isAvailable, // Оставляем это имя для совместимости
    // Callbacks
    setTransactionsUpdateCallback,
    setCategoriesUpdateCallback,
    setBudgetsUpdateCallback,
    setGoalsUpdateCallback,
    setRecurringPaymentsUpdateCallback,
    // CRUD
    addTransaction: transactionCrud.add,
    updateTransaction: transactionCrud.update,
    deleteTransaction: transactionCrud.remove,
    addCategory: categoryCrud.add,
    updateCategory: categoryCrud.update,
    deleteCategory: categoryCrud.remove,
    addBudget: budgetCrud.add,
    updateBudget: budgetCrud.update,
    deleteBudget: budgetCrud.remove,
    addGoal: goalCrud.add,
    updateGoal: goalCrud.update,
    deleteGoal: goalCrud.remove,
    addRecurringPayment: recurringPaymentCrud.add,
    updateRecurringPayment: recurringPaymentCrud.update,
    deleteRecurringPayment: recurringPaymentCrud.remove,
    // Дополнительные функции
    syncAllData, // Функция для ручной синхронизации
  };
}
