import { neon } from '@neondatabase/serverless';

// Simple client for Neon database
export class NeonClient {
  private sql: any;
  private baseUrl: string;

  constructor() {
    // For local development, use the API functions
    this.baseUrl = import.meta.env.PROD 
      ? '/.netlify/functions/api' 
      : 'http://localhost:8888/.netlify/functions/api';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': this.getUserId(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private getUserId(): string {
    // Simple user identification - in production, use proper auth
    let userId = localStorage.getItem('finance-app-user-id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('finance-app-user-id', userId);
    }
    return userId;
  }

  // Transactions
  async getTransactions() {
    return this.makeRequest('/transactions');
  }

  async addTransaction(transaction: any) {
    return this.makeRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, updates: any) {
    return this.makeRequest('/transactions', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  }

  async deleteTransaction(id: string) {
    return this.makeRequest('/transactions', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  // Categories
  async getCategories() {
    return this.makeRequest('/categories');
  }

  async addCategory(category: any) {
    return this.makeRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  // Budgets
  async getBudgets() {
    return this.makeRequest('/budgets');
  }

  async addBudget(budget: any) {
    return this.makeRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  }

  // Goals
  async getGoals() {
    return this.makeRequest('/goals');
  }

  async addGoal(goal: any) {
    return this.makeRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  // Recurring Payments
  async getRecurringPayments() {
    return this.makeRequest('/recurring-payments');
  }

  async addRecurringPayment(payment: any) {
    return this.makeRequest('/recurring-payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  // Initialize database (call once on first deploy)
  async initializeDatabase() {
    const response = await fetch('/.netlify/functions/init-database', {
      method: 'POST',
    });
    return response.json();
  }

  // Seed default data
  async seedDefaultData() {
    const response = await fetch('/.netlify/functions/seed-data', {
      method: 'POST',
    });
    return response.json();
  }
}

export const neonClient = new NeonClient();