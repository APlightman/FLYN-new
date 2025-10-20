import { Transaction, Category, Budget, FinancialGoal, RecurringPayment } from '../types';

// Базовый URL для API TimeWebCloud
// TODO: Заменить на реальный URL вашего TimeWebCloud API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_TIMEWEB_API_URL || 'http://localhost:3001/api';

// Типы для API
export interface TimeWebTransaction extends Transaction {
  userId: string;
}

export interface TimeWebCategory extends Category {
  userId: string;
}

export interface TimeWebBudget extends Budget {
  userId: string;
}

export interface TimeWebGoal extends FinancialGoal {
  userId: string;
}

export interface TimeWebRecurringPayment extends RecurringPayment {
  userId: string;
}

// Установка токена аутентификации
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  console.log('Auth token set:', token ? 'token present' : 'null');
};

// Утилита для выполнения API запросов
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

// API для транзакций
export const transactionsApi = {
  getAll: async (): Promise<Transaction[]> => {
    return apiRequest(`/transactions`);
  },
  
  create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },
  
  update: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    return apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// API для категорий
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return apiRequest(`/categories`);
  },
  
  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
  
  update: async (id: string, updates: Partial<Category>): Promise<Category> => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// API для бюджетов
export const budgetsApi = {
  getAll: async (): Promise<Budget[]> => {
    return apiRequest(`/budgets`);
  },
  
  create: async (budget: Omit<Budget, 'id'>): Promise<Budget> => {
    return apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  },
  
  update: async (id: string, updates: Partial<Budget>): Promise<Budget> => {
    return apiRequest(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};

// API для финансовых целей
export const goalsApi = {
  getAll: async (): Promise<FinancialGoal[]> => {
    return apiRequest(`/goals`);
  },
  
  create: async (goal: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> => {
    return apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },
  
  update: async (id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> => {
    return apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/goals/${id}`, {
      method: 'DELETE',
    });
  },
};

// API для регулярных платежей
export const recurringPaymentsApi = {
  getAll: async (): Promise<RecurringPayment[]> => {
    return apiRequest(`/recurring-payments`);
  },
  
  create: async (payment: Omit<RecurringPayment, 'id'>): Promise<RecurringPayment> => {
    return apiRequest('/recurring-payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },
  
  update: async (id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment> => {
    return apiRequest(`/recurring-payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/recurring-payments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Функция для инициализации API с токеном аутентификации
export const initApiWithAuth = (token: string) => {
  // Переопределяем apiRequest для добавления токена
  const authenticatedApiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  };

  // Обновляем все API функции для использования аутентифицированных запросов
  const updateApiWithAuth = () => {
    // Реализация будет добавлена позже при интеграции с контекстом
  };

  return { authenticatedApiRequest, updateApiWithAuth };
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