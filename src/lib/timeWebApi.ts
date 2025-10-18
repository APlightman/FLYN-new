import { Transaction, Category, Budget, FinancialGoal, RecurringPayment } from '../types';

// Базовый URL для API TimeWebCloud
// TODO: Заменить на реальный URL вашего TimeWebCloud API
const API_BASE_URL = import.meta.env.VITE_TIMEWEB_API_URL || 'http://localhost:3001/api';

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

// Утилита для выполнения API запросов
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
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

// Установка токена аутентификации
export const setAuthToken = (token: string | null) => {
  if (token) {
    // Токен будет добавляться к каждому запросу в заголовке
    // Это реализуется в контексте приложения
  }
};

// API для транзакций
export const transactionsApi = {
  getAll: async (userId: string): Promise<Transaction[]> => {
    return apiRequest(`/transactions?userId=${userId}`);
  },
  
  create: async (transaction: Omit<Transaction, 'id'>, userId: string): Promise<Transaction> => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify({ ...transaction, userId }),
    });
  },
  
  update: async (id: string, updates: Partial<Transaction>, userId: string): Promise<Transaction> => {
    return apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, userId }),
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
  getAll: async (userId: string): Promise<Category[]> => {
    return apiRequest(`/categories?userId=${userId}`);
  },
  
  create: async (category: Omit<Category, 'id'>, userId: string): Promise<Category> => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify({ ...category, userId }),
    });
  },
  
  update: async (id: string, updates: Partial<Category>, userId: string): Promise<Category> => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, userId }),
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
  getAll: async (userId: string): Promise<Budget[]> => {
    return apiRequest(`/budgets?userId=${userId}`);
  },
  
  create: async (budget: Omit<Budget, 'id'>, userId: string): Promise<Budget> => {
    return apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify({ ...budget, userId }),
    });
  },
  
  update: async (id: string, updates: Partial<Budget>, userId: string): Promise<Budget> => {
    return apiRequest(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, userId }),
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
  getAll: async (userId: string): Promise<FinancialGoal[]> => {
    return apiRequest(`/goals?userId=${userId}`);
  },
  
  create: async (goal: Omit<FinancialGoal, 'id'>, userId: string): Promise<FinancialGoal> => {
    return apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify({ ...goal, userId }),
    });
  },
  
  update: async (id: string, updates: Partial<FinancialGoal>, userId: string): Promise<FinancialGoal> => {
    return apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, userId }),
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
  getAll: async (userId: string): Promise<RecurringPayment[]> => {
    return apiRequest(`/recurring-payments?userId=${userId}`);
  },
  
  create: async (payment: Omit<RecurringPayment, 'id'>, userId: string): Promise<RecurringPayment> => {
    return apiRequest('/recurring-payments', {
      method: 'POST',
      body: JSON.stringify({ ...payment, userId }),
    });
  },
  
  update: async (id: string, updates: Partial<RecurringPayment>, userId: string): Promise<RecurringPayment> => {
    return apiRequest(`/recurring-payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, userId }),
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