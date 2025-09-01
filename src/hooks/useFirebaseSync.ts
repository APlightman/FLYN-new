import { useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
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

interface SyncState {
  syncing: boolean;
  lastSync: Date | null;
  error: string | null;
  retryCount: number;
  isOnline: boolean;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
};

export function useFirebaseSync() {
  const { user, isFirebaseEnabled } = useFirebaseAuth();
  const [syncState, setSyncState] = useState<SyncState>({
    syncing: false,
    lastSync: null,
    error: null,
    retryCount: 0,
    isOnline: navigator.onLine
  });

  // Проверяем доступность Firebase для операций
  const isAvailable = isFirebaseEnabled && isFirebaseConfigured && db && user;

  // Утилита для retry логики с exponential backoff
  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG,
    operationName: string = 'operation'
  ): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        setSyncState(prev => ({ ...prev, retryCount: attempt }));
        
        const result = await operation();
        
        setSyncState(prev => ({ 
          ...prev, 
          error: null, 
          retryCount: 0 
        }));
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        console.warn(`${operationName} attempt ${attempt + 1} failed:`, error);
        
        if (attempt === config.maxRetries) {
          break;
        }
        
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          config.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const errorMessage = `${operationName} failed after ${config.maxRetries + 1} attempts: ${lastError?.message}`;
    
    setSyncState(prev => ({ 
      ...prev, 
      error: errorMessage,
      retryCount: 0
    }));
    
    throw new Error(errorMessage);
  }, []);

  // Безопасная обертка для операций с базой данных
  const safeDbOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string
  ): Promise<T> => {
    if (!isAvailable) {
      console.warn(`${operationName}: Firebase not available, returning fallback`);
      return fallbackValue;
    }

    try {
      return await withRetry(operation, DEFAULT_RETRY_CONFIG, operationName);
    } catch (error) {
      console.error(`${operationName} failed completely:`, error);
      return fallbackValue;
    }
  }, [isAvailable, withRetry]);

  // Конвертеры между типами приложения и Firestore
  const convertToFirestoreTransaction = (transaction: Transaction): Omit<FirestoreTransaction, 'id'> => ({
    userId: user!.uid,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
    tags: transaction.tags,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const convertFromFirestoreTransaction = (doc: any): Transaction => ({
    id: doc.id,
    type: doc.data().type,
    amount: doc.data().amount,
    category: doc.data().category,
    description: doc.data().description,
    date: doc.data().date,
    tags: doc.data().tags
  });

  const convertToFirestoreCategory = (category: Category): Omit<FirestoreCategory, 'id'> => ({
    userId: user!.uid,
    name: category.name,
    type: category.type,
    color: category.color,
    parent: category.parent,
    budget: category.budget,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const convertFromFirestoreCategory = (doc: any): Category => ({
    id: doc.id,
    name: doc.data().name,
    type: doc.data().type,
    color: doc.data().color,
    parent: doc.data().parent,
    budget: doc.data().budget
  });

  // Синхронизация транзакций
  const syncTransactions = useCallback(async (localTransactions: Transaction[]) => {
    return await safeDbOperation(
      async () => {
        setSyncState(prev => ({ ...prev, syncing: true, error: null }));

        const transactionsRef = collection(db!, COLLECTIONS.TRANSACTIONS);
        const q = query(
          transactionsRef, 
          where('userId', '==', user!.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const serverTransactions = querySnapshot.docs.map(convertFromFirestoreTransaction);

        const serverIds = new Set(serverTransactions.map(t => t.id));
        const newLocalTransactions = localTransactions.filter(t => !serverIds.has(t.id));

        // Batch upload новых транзакций
        if (newLocalTransactions.length > 0) {
          const batch = writeBatch(db!);
          
          newLocalTransactions.forEach(transaction => {
            const docRef = doc(transactionsRef, transaction.id);
            batch.set(docRef, convertToFirestoreTransaction(transaction));
          });
          
          await batch.commit();
        }

        const mergedTransactions = [...serverTransactions, ...newLocalTransactions];

        setSyncState(prev => ({ 
          ...prev, 
          syncing: false, 
          lastSync: new Date(),
          error: null 
        }));

        console.log(`Transactions sync completed: ${serverTransactions.length} from server, ${newLocalTransactions.length} uploaded`);
        return mergedTransactions;
      },
      localTransactions,
      'syncTransactions'
    );
  }, [safeDbOperation, user]);

  // Синхронизация категорий
  const syncCategories = useCallback(async (localCategories: Category[]) => {
    return await safeDbOperation(
      async () => {
        const categoriesRef = collection(db!, COLLECTIONS.CATEGORIES);
        const q = query(categoriesRef, where('userId', '==', user!.uid));
        
        const querySnapshot = await getDocs(q);
        const serverCategories = querySnapshot.docs.map(convertFromFirestoreCategory);

        const serverIds = new Set(serverCategories.map(c => c.id));
        const newLocalCategories = localCategories.filter(c => !serverIds.has(c.id));

        if (newLocalCategories.length > 0) {
          const batch = writeBatch(db!);
          
          newLocalCategories.forEach(category => {
            const docRef = doc(categoriesRef, category.id);
            batch.set(docRef, convertToFirestoreCategory(category));
          });
          
          await batch.commit();
        }

        console.log(`Categories sync completed: ${serverCategories.length} from server, ${newLocalCategories.length} uploaded`);
        return [...serverCategories, ...newLocalCategories];
      },
      localCategories,
      'syncCategories'
    );
  }, [safeDbOperation, user]);

  // CRUD операции для транзакций
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    return await safeDbOperation(
      async () => {
        const transactionsRef = collection(db!, COLLECTIONS.TRANSACTIONS);
        const docRef = await addDoc(transactionsRef, convertToFirestoreTransaction({
          ...transaction,
          id: crypto.randomUUID()
        }));

        console.log(`Transaction added: ${docRef.id}`);
        return { ...transaction, id: docRef.id };
      },
      null,
      'addTransaction'
    );
  }, [safeDbOperation, user]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    return await safeDbOperation(
      async () => {
        const docRef = doc(db!, COLLECTIONS.TRANSACTIONS, id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });

        console.log(`Transaction updated: ${id}`);
        return true;
      },
      false,
      'updateTransaction'
    );
  }, [safeDbOperation]);

  const deleteTransaction = useCallback(async (id: string) => {
    return await safeDbOperation(
      async () => {
        const docRef = doc(db!, COLLECTIONS.TRANSACTIONS, id);
        await deleteDoc(docRef);

        console.log(`Transaction deleted: ${id}`);
        return true;
      },
      false,
      'deleteTransaction'
    );
  }, [safeDbOperation]);

  // CRUD операции для категорий
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    return await safeDbOperation(
      async () => {
        const categoriesRef = collection(db!, COLLECTIONS.CATEGORIES);
        const docRef = await addDoc(categoriesRef, convertToFirestoreCategory({
          ...category,
          id: crypto.randomUUID()
        }));

        console.log(`Category added: ${docRef.id}`);
        return { ...category, id: docRef.id };
      },
      null,
      'addCategory'
    );
  }, [safeDbOperation, user]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    return await safeDbOperation(
      async () => {
        const docRef = doc(db!, COLLECTIONS.CATEGORIES, id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });

        console.log(`Category updated: ${id}`);
        return true;
      },
      false,
      'updateCategory'
    );
  }, [safeDbOperation]);

  const deleteCategory = useCallback(async (id: string) => {
    return await safeDbOperation(
      async () => {
        const docRef = doc(db!, COLLECTIONS.CATEGORIES, id);
        await deleteDoc(docRef);

        console.log(`Category deleted: ${id}`);
        return true;
      },
      false,
      'deleteCategory'
    );
  }, [safeDbOperation]);

  // Заглушки для остальных операций (будут реализованы аналогично)
  const syncBudgets = useCallback(async (localBudgets: Budget[]) => localBudgets, []);
  const syncGoals = useCallback(async (localGoals: FinancialGoal[]) => localGoals, []);
  const syncRecurringPayments = useCallback(async (localPayments: RecurringPayment[]) => localPayments, []);

  const addBudget = useCallback(async (budget: any) => null, []);
  const updateBudget = useCallback(async (id: string, updates: any) => false, []);
  const deleteBudget = useCallback(async (id: string) => false, []);

  const addGoal = useCallback(async (goal: any) => null, []);
  const updateGoal = useCallback(async (id: string, updates: any) => false, []);
  const deleteGoal = useCallback(async (id: string) => false, []);

  const addRecurringPayment = useCallback(async (payment: any) => null, []);
  const updateRecurringPayment = useCallback(async (id: string, updates: any) => false, []);
  const deleteRecurringPayment = useCallback(async (id: string) => false, []);

  return {
    syncState,
    isFirebaseAvailable: isAvailable,
    syncTransactions,
    syncCategories,
    syncBudgets,
    syncGoals,
    syncRecurringPayments,
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
    deleteRecurringPayment
  };
}
