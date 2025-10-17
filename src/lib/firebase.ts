import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, FieldValue } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Конфигурация Firebase (точно по документации)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Валидация API ключа Firebase
const validateFirebaseConfig = () => {
  const issues = [];
  
  if (!firebaseConfig.apiKey) {
    issues.push('VITE_FIREBASE_API_KEY не установлен');
  } else if (firebaseConfig.apiKey === 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    issues.push('VITE_FIREBASE_API_KEY содержит демо-значение, замените на реальный ключ');
  } else if (!firebaseConfig.apiKey.startsWith('AIzaSy')) {
    issues.push('VITE_FIREBASE_API_KEY имеет неверный формат (должен начинаться с "AIzaSy")');
  } else if (firebaseConfig.apiKey.length < 35) {
    issues.push('VITE_FIREBASE_API_KEY слишком короткий (должен быть ~39 символов)');
  }
  
  if (!firebaseConfig.authDomain) {
    issues.push('VITE_FIREBASE_AUTH_DOMAIN не установлен');
  } else if (firebaseConfig.authDomain === 'financetracker-demo.firebaseapp.com') {
    issues.push('VITE_FIREBASE_AUTH_DOMAIN содержит демо-значение');
  }
  
  if (!firebaseConfig.projectId) {
    issues.push('VITE_FIREBASE_PROJECT_ID не установлен');
  } else if (firebaseConfig.projectId === 'financetracker-demo') {
    issues.push('VITE_FIREBASE_PROJECT_ID содержит демо-значение');
  }
  
  return issues;
};

// Проверка конфигурации перед инициализацией
const configIssues = validateFirebaseConfig();
export const isFirebaseConfigured = configIssues.length === 0;

// Логирование проблем конфигурации
if (configIssues.length > 0) {
  console.warn('🔥 Firebase Configuration Issues:');
  configIssues.forEach(issue => console.warn(`  ❌ ${issue}`));
  console.warn('📝 Проверьте файл .env и убедитесь, что все переменные установлены корректно');
}

// Инициализация Firebase App (по официальной документации)
export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Инициализация сервисов Firebase
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const analytics = app && typeof window !== 'undefined' ? getAnalytics(app) : null;

// Подключение эмуляторов для разработки
if (import.meta.env.DEV && auth && db) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch {
    console.log('Firebase emulators not available or already connected');
  }
}

// Управление оффлайн режимом Firestore
export const enableFirestoreOffline = async () => {
  if (db) {
    try {
      await disableNetwork(db);
      console.log('Firestore offline mode enabled');
    } catch (error) {
      console.error('Error enabling offline mode:', error);
    }
  }
};

export const enableFirestoreOnline = async () => {
  if (db) {
    try {
      await enableNetwork(db);
      console.log('Firestore online mode enabled');
    } catch (error) {
      console.error('Error enabling online mode:', error);
    }
  }
};

// Диагностика состояния Firebase
export const getFirebaseStatus = () => {
  if (!isFirebaseConfigured) {
    return {
      available: false,
      message: 'Firebase не настроен. Работаем в локальном режиме.',
      details: {
        hasApiKey: !!firebaseConfig.apiKey,
        hasAuthDomain: !!firebaseConfig.authDomain,
        hasProjectId: !!firebaseConfig.projectId,
        configIssues
      }
    };
  }
  
  if (!app || !auth || !db) {
    return {
      available: false,
      message: 'Ошибка инициализации Firebase.',
      details: {
        hasApp: !!app,
        hasAuth: !!auth,
        hasDb: !!db,
        configIssues
      }
    };
  }
  
  return {
    available: true,
    message: 'Firebase подключен успешно.',
    details: {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      online: navigator.onLine,
      configIssues: []
    }
  };
};

// Константы коллекций Firestore
export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  CATEGORIES: 'categories',
  BUDGETS: 'budgets',
  GOALS: 'goals',
  RECURRING_PAYMENTS: 'recurringPayments'
} as const;

// TypeScript интерфейсы для Firestore документов
export interface FirestoreUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  version: number;
}

export interface FirestoreTransaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  tags?: string[];
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  version: number;
}

export interface FirestoreCategory {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  parent?: string;
  budget?: number;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  version: number;
}

export interface FirestoreBudget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'yearly';
  spent: number;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  version: number;
}

export interface FirestoreGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  version: number;
}

export interface FirestoreRecurringPayment {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  cronExpression?: string;
  nextDate: string;
  isActive: boolean;
  description?: string;
  createdAt: Date | FieldValue;
  updatedAt: Date | FieldValue;
  version: number;
}

// Утилиты для работы с UID
export const validateUID = (uid: string): boolean => {
  return !!(uid && uid.length >= 20 && /^[a-zA-Z0-9]+$/.test(uid));
};

export const getUserByUID = async (uid: string) => {
  if (!db || !validateUID(uid)) {
    throw new Error('Неверный UID или Firebase не настроен');
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('Пользователь не найден');
    }

    return userSnap.data() as FirestoreUser;
  } catch (error) {
    console.error('Error fetching user by UID:', error);
    throw error;
  }
};

// Утилита для проверки доступности Firestore
export const checkFirestoreConnection = async (): Promise<boolean> => {
  if (!db) return false;
  
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const testRef = doc(db, 'test', 'connection');
    await getDoc(testRef);
    return true;
  } catch (error) {
    console.warn('Firestore connection check failed:', error);
    return false;
  }
};
