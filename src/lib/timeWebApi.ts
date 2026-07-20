import type {
  Budget,
  Category,
  FinancialGoal,
  RecurringPayment,
  Transaction,
} from "../types";

// Desktop-first implementation. Cloud/TimeWeb sync is intentionally paused for
// the desktop release, so this compatibility layer delegates to Electron/SQLite.

type DomainData = {
  transactions?: Transaction[];
  categories?: Category[];
  budgets?: Budget[];
  goals?: FinancialGoal[];
  recurringPayments?: RecurringPayment[];
  success?: boolean;
  error?: string;
};

type EntityType =
  | "transaction"
  | "category"
  | "budget"
  | "goal"
  | "recurringPayment";

const listDomainData = async (): Promise<Required<Omit<DomainData, "success" | "error">>> => {
  if (!window.electronAPI?.listDomainData) {
    console.warn("Electron API is not available. Returning empty desktop data.");
    return {
      transactions: [],
      categories: [],
      budgets: [],
      goals: [],
      recurringPayments: [],
    };
  }

  const result: DomainData = await window.electronAPI.listDomainData();

  if (result.success === false) {
    console.error("Failed to list desktop domain data:", result.error);
  }

  return {
    transactions: result.transactions ?? [],
    categories: result.categories ?? [],
    budgets: result.budgets ?? [],
    goals: result.goals ?? [],
    recurringPayments: result.recurringPayments ?? [],
  };
};

const getAllFactory =
  <T>(entityType: keyof Awaited<ReturnType<typeof listDomainData>>) =>
  async (): Promise<T[]> => {
    const data = await listDomainData();
    return (data[entityType] as T[]) ?? [];
  };

const createEntity = async <T>(
  entityType: EntityType,
  payload: unknown,
): Promise<T> => {
  if (!window.electronAPI?.createEntity) {
    throw new Error("Electron API недоступен");
  }

  const result = await window.electronAPI.createEntity(entityType, payload);
  if (!result.success) {
    throw new Error(result.error || `Не удалось создать сущность: ${entityType}`);
  }

  return (result.item ?? result) as T;
};

const updateEntity = async <T>(
  entityType: EntityType,
  id: string,
  updates: unknown,
): Promise<T> => {
  if (!window.electronAPI?.updateEntity) {
    throw new Error("Electron API недоступен");
  }

  const result = await window.electronAPI.updateEntity(entityType, id, updates);
  if (!result.success) {
    throw new Error(result.error || `Не удалось обновить сущность: ${entityType}`);
  }

  return (result.item ?? result) as T;
};

const deleteEntity = async (
  entityType: EntityType,
  id: string,
): Promise<void> => {
  if (!window.electronAPI?.deleteEntity) {
    throw new Error("Electron API недоступен");
  }

  const result = await window.electronAPI.deleteEntity(entityType, id);
  if (!result.success) {
    throw new Error(result.error || `Не удалось удалить сущность: ${entityType}`);
  }
};

export const transactionsApi = {
  getAll: getAllFactory<Transaction>("transactions"),
  create: (transaction: Omit<Transaction, "id">): Promise<Transaction> =>
    createEntity("transaction", transaction),
  update: (id: string, updates: Partial<Transaction>): Promise<Transaction> =>
    updateEntity("transaction", id, updates),
  delete: (id: string): Promise<void> => deleteEntity("transaction", id),
};

export const categoriesApi = {
  getAll: getAllFactory<Category>("categories"),
  create: (category: Omit<Category, "id">): Promise<Category> =>
    createEntity("category", category),
  update: (id: string, updates: Partial<Category>): Promise<Category> =>
    updateEntity("category", id, updates),
  delete: (id: string): Promise<void> => deleteEntity("category", id),
};

export const budgetsApi = {
  getAll: getAllFactory<Budget>("budgets"),
  create: (budget: Omit<Budget, "id">): Promise<Budget> =>
    createEntity("budget", budget),
  update: (id: string, updates: Partial<Budget>): Promise<Budget> =>
    updateEntity("budget", id, updates),
  delete: (id: string): Promise<void> => deleteEntity("budget", id),
};

export const goalsApi = {
  getAll: getAllFactory<FinancialGoal>("goals"),
  create: (goal: Omit<FinancialGoal, "id">): Promise<FinancialGoal> =>
    createEntity("goal", goal),
  update: (id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> =>
    updateEntity("goal", id, updates),
  delete: (id: string): Promise<void> => deleteEntity("goal", id),
};

export const recurringPaymentsApi = {
  getAll: getAllFactory<RecurringPayment>("recurringPayments"),
  create: (
    payment: Omit<RecurringPayment, "id">,
  ): Promise<RecurringPayment> => createEntity("recurringPayment", payment),
  update: (
    id: string,
    updates: Partial<RecurringPayment>,
  ): Promise<RecurringPayment> => updateEntity("recurringPayment", id, updates),
  delete: (id: string): Promise<void> => deleteEntity("recurringPayment", id),
};

export const setAuthToken = () => {
  // Cloud auth is paused for the desktop-first release.
};

export const initApiWithAuth = () => ({});

export default {
  transactionsApi,
  categoriesApi,
  budgetsApi,
  goalsApi,
  recurringPaymentsApi,
  setAuthToken,
  initApiWithAuth,
};
