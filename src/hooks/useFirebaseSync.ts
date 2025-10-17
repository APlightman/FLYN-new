import { useState, useCallback, useEffect, useRef } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured, COLLECTIONS } from '../lib/firebase';
import { useFirebaseAuth } from './useFirebaseAuth';
import { Transaction, Category, Budget, FinancialGoal, RecurringPayment } from '../types';
import type {
  FirestoreTransaction,
  FirestoreCategory,
  FirestoreBudget,
  FirestoreGoal,
  FirestoreRecurringPayment
} from '../lib/firebase';

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
}

// --- MAIN HOOK ---
export function useFirebaseSync(syncOptions: SyncOptions = {}) {
  const { user, isFirebaseEnabled } = useFirebaseAuth();
  const [syncState, setSyncState] = useState<SyncState>({
    syncing: false,
    lastSync: null,
    error: null
  });
  
  const listenersRef = useRef<Record<string, Unsubscribe>>({});
  
  // --- REAL-TIME UPDATE CALLBACKS ---
  const [onTransactionsUpdate, setOnTransactionsUpdate] = useState<(items: Transaction[]) => void>(() => () => {});
  const [onCategoriesUpdate, setOnCategoriesUpdate] = useState<(items: Category[]) => void>(() => () => {});
  const [onBudgetsUpdate, setOnBudgetsUpdate] = useState<(items: Budget[]) => void>(() => () => {});
  const [onGoalsUpdate, setOnGoalsUpdate] = useState<(items: FinancialGoal[]) => void>(() => () => {});
  const [onRecurringPaymentsUpdate, setOnRecurringPaymentsUpdate] = useState<(items: RecurringPayment[]) => void>(() => () => {});

  const isAvailable = isFirebaseEnabled && isFirebaseConfigured && db && user;
  
  // --- REAL-TIME LISTENERS EFFECT ---
  useEffect(() => {
    if (!isAvailable) {
      // Clean up all listeners if user logs out or Firebase becomes unavailable
      Object.values(listenersRef.current).forEach(unsubscribe => unsubscribe());
      listenersRef.current = {};
      return;
    }

    const setupListener = <T>(
      collectionName: string,
      converter: (doc: QueryDocumentSnapshot<DocumentData>) => T,
      callback: (items: T[]) => void
    ) => {
      const q = query(collection(db!, collectionName), where('userId', '==', user!.uid));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(converter);
        // Здесь можно добавить логику разрешения конфликтов при необходимости
        callback(items);
        setSyncState(prev => ({ ...prev, lastSync: new Date(), error: null }));
      }, (error) => {
        console.error(`${collectionName} listener error:`, error);
        setSyncState(prev => ({ ...prev, error: `Ошибка синхронизации ${collectionName}` }));
      });

      listenersRef.current[collectionName] = unsubscribe;
    };

    // Устанавливаем слушатели только для выбранных типов данных
    if (syncOptions.syncTransactions !== false) {
      setupListener(COLLECTIONS.TRANSACTIONS, convertFromFirestoreTransaction, onTransactionsUpdate);
    }
    
    if (syncOptions.syncCategories !== false) {
      setupListener(COLLECTIONS.CATEGORIES, convertFromFirestoreCategory, onCategoriesUpdate);
    }
    
    if (syncOptions.syncBudgets !== false) {
      setupListener(COLLECTIONS.BUDGETS, convertFromFirestoreBudget, onBudgetsUpdate);
    }
    
    if (syncOptions.syncGoals !== false) {
      setupListener(COLLECTIONS.GOALS, convertFromFirestoreGoal, onGoalsUpdate);
    }
    
    if (syncOptions.syncRecurringPayments !== false) {
      setupListener(COLLECTIONS.RECURRING_PAYMENTS, convertFromFirestoreRecurringPayment, onRecurringPaymentsUpdate);
    }

    return () => {
      Object.values(listenersRef.current).forEach(unsubscribe => unsubscribe());
      listenersRef.current = {};
    };
  }, [isAvailable, user, onTransactionsUpdate, onCategoriesUpdate, onBudgetsUpdate, onGoalsUpdate, onRecurringPaymentsUpdate, syncOptions]);
  
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
      console.warn(`${operationName}: Firebase not available.`);
      setSyncState(prev => ({ ...prev, error: 'Нет подключения к базе данных' }));
      return null;
    }
    try {
      return await operation();
    } catch (error) {
      console.error(`${operationName} failed:`, error);
      setSyncState(prev => ({ ...prev, error: `Ошибка операции: ${operationName}` }));
      return null;
    }
  }, [isAvailable]);

  // --- DATA CONVERTERS ---
  const convertFromFirestoreTransaction = (doc: QueryDocumentSnapshot<DocumentData>): Transaction => ({ id: doc.id, ...doc.data() } as Transaction);
  const convertToFirestoreTransaction = (data: Omit<Transaction, 'id'>): Omit<FirestoreTransaction, 'id'> => ({ ...data, userId: user!.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), version: data.version || 1 });

  const convertFromFirestoreCategory = (doc: QueryDocumentSnapshot<DocumentData>): Category => ({ id: doc.id, ...doc.data() } as Category);
  const convertToFirestoreCategory = (data: Omit<Category, 'id'>): Omit<FirestoreCategory, 'id'> => ({ ...data, userId: user!.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), version: data.version || 1 });

  const convertFromFirestoreBudget = (doc: QueryDocumentSnapshot<DocumentData>): Budget => ({ id: doc.id, ...doc.data() } as Budget);
  const convertToFirestoreBudget = (data: Omit<Budget, 'id'>): Omit<FirestoreBudget, 'id'> => ({ ...data, userId: user!.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), version: data.version || 1 });

  const convertFromFirestoreGoal = (doc: QueryDocumentSnapshot<DocumentData>): FinancialGoal => ({ id: doc.id, ...doc.data() } as FinancialGoal);
  const convertToFirestoreGoal = (data: Omit<FinancialGoal, 'id'>): Omit<FirestoreGoal, 'id'> => ({ ...data, userId: user!.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), version: data.version || 1 });

  const convertFromFirestoreRecurringPayment = (doc: QueryDocumentSnapshot<DocumentData>): RecurringPayment => ({ id: doc.id, ...doc.data() } as RecurringPayment);
  const convertToFirestoreRecurringPayment = (data: Omit<RecurringPayment, 'id'>): Omit<FirestoreRecurringPayment, 'id'> => ({ ...data, userId: user!.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), version: data.version || 1 });

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

  // --- GENERIC CRUD FUNCTIONS ---
  const createCrudFunctions = <T, U>(collectionName: string, converter: (data: Omit<T, 'id'>) => Omit<U, 'id'>, validator: (data: Omit<T, 'id'>) => boolean) => ({
    add: (data: Omit<T, 'id'>) => {
      if (!validator(data)) {
        console.error(`Validation failed for ${collectionName}:`, data);
        setSyncState(prev => ({ ...prev, error: `Ошибка валидации данных ${collectionName}` }));
        return Promise.resolve(null);
      }
      return safeDbOperation(() => addDoc(collection(db!, collectionName), converter(data)), `add${collectionName}`);
    },
    update: (id: string, updates: Partial<T>) => {
      // Для обновлений валидация может быть менее строгой, проверяем только переданные поля
      return safeDbOperation(() => updateDoc(doc(db!, collectionName, id), { ...updates, updatedAt: serverTimestamp() }), `update${collectionName}`);
    },
    remove: (id: string) => safeDbOperation(() => deleteDoc(doc(db!, collectionName, id)), `delete${collectionName}`),
  });

  const transactionCrud = createCrudFunctions<Transaction, FirestoreTransaction>(COLLECTIONS.TRANSACTIONS, convertToFirestoreTransaction, validateTransaction);
  const categoryCrud = createCrudFunctions<Category, FirestoreCategory>(COLLECTIONS.CATEGORIES, convertToFirestoreCategory, validateCategory);
  const budgetCrud = createCrudFunctions<Budget, FirestoreBudget>(COLLECTIONS.BUDGETS, convertToFirestoreBudget, validateBudget);
  const goalCrud = createCrudFunctions<FinancialGoal, FirestoreGoal>(COLLECTIONS.GOALS, convertToFirestoreGoal, validateGoal);
  const recurringPaymentCrud = createCrudFunctions<RecurringPayment, FirestoreRecurringPayment>(COLLECTIONS.RECURRING_PAYMENTS, convertToFirestoreRecurringPayment, validateRecurringPayment);

  return {
    syncState,
    isFirebaseAvailable: isAvailable,
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
  };
}