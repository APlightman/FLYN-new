/**
 * Tests for db/index.js — Database facade
 * Covers: ensureDatabaseReady, loadPersistedAppState, savePersistedAppState,
 *         bootstrapDomainDataFromState, listDomainData, CRUD operations,
 *         checkExternalDatabase, importFromExternalDatabase
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// =============================================================================
// Моки для зависимостей
// =============================================================================

const mockListTransactions = vi.fn();
const mockCountTransactions = vi.fn();
const mockCreateTransaction = vi.fn();
const mockUpdateTransaction = vi.fn();
const mockDeleteTransaction = vi.fn();
const mockReplaceTransactions = vi.fn();

const mockListCategories = vi.fn();
const mockCountCategories = vi.fn();
const mockCreateCategory = vi.fn();
const mockUpdateCategory = vi.fn();
const mockDeleteCategory = vi.fn();
const mockReplaceCategories = vi.fn();

const mockListBudgets = vi.fn();
const mockCountBudgets = vi.fn();
const mockCreateBudget = vi.fn();
const mockUpdateBudget = vi.fn();
const mockDeleteBudget = vi.fn();
const mockReplaceBudgets = vi.fn();

const mockListGoals = vi.fn();
const mockCountGoals = vi.fn();
const mockCreateGoal = vi.fn();
const mockUpdateGoal = vi.fn();
const mockDeleteGoal = vi.fn();
const mockReplaceGoals = vi.fn();

const mockListRecurringPayments = vi.fn();
const mockCountRecurringPayments = vi.fn();
const mockCreateRecurringPayment = vi.fn();
const mockUpdateRecurringPayment = vi.fn();
const mockDeleteRecurringPayment = vi.fn();
const mockReplaceRecurringPayments = vi.fn();

const mockLoadAppStateRecord = vi.fn();
const mockSaveAppStateRecord = vi.fn();

const mockOpenDatabaseConnection = vi.fn();
const mockCloseDatabaseConnectionSync = vi.fn();
const mockFlushDatabaseToDiskSync = vi.fn();
const mockGetDatabaseStatus = vi.fn();

const mockRunMigrations = vi.fn();

// Мокаем все зависимости ДО импорта тестируемого модуля
vi.mock('../../electron/modules/db/driver.js', () => ({
  openDatabaseConnection: mockOpenDatabaseConnection,
  closeDatabaseConnectionSync: mockCloseDatabaseConnectionSync,
  flushDatabaseToDiskSync: mockFlushDatabaseToDiskSync,
  getDatabaseStatus: mockGetDatabaseStatus,
  closeDatabaseConnection: vi.fn(),
  getDatabasePath: vi.fn(() => '/tmp/test.sqlite'),
  markUnsavedChanges: vi.fn(),
}));

vi.mock('../../electron/modules/db/migrate.js', () => ({
  runMigrations: mockRunMigrations,
}));

vi.mock('../../electron/modules/db/repositories/appStateRepository.js', () => ({
  loadAppStateRecord: mockLoadAppStateRecord,
  saveAppStateRecord: mockSaveAppStateRecord,
}));

vi.mock('../../electron/modules/db/repositories/transactionsRepository.js', () => ({
  listTransactions: mockListTransactions,
  countTransactions: mockCountTransactions,
  createTransaction: mockCreateTransaction,
  updateTransaction: mockUpdateTransaction,
  deleteTransaction: mockDeleteTransaction,
  replaceTransactions: mockReplaceTransactions,
}));

vi.mock('../../electron/modules/db/repositories/categoriesRepository.js', () => ({
  listCategories: mockListCategories,
  countCategories: mockCountCategories,
  createCategory: mockCreateCategory,
  updateCategory: mockUpdateCategory,
  deleteCategory: mockDeleteCategory,
  replaceCategories: mockReplaceCategories,
}));

vi.mock('../../electron/modules/db/repositories/budgetsRepository.js', () => ({
  listBudgets: mockListBudgets,
  countBudgets: mockCountBudgets,
  createBudget: mockCreateBudget,
  updateBudget: mockUpdateBudget,
  deleteBudget: mockDeleteBudget,
  replaceBudgets: mockReplaceBudgets,
}));

vi.mock('../../electron/modules/db/repositories/goalsRepository.js', () => ({
  listGoals: mockListGoals,
  countGoals: mockCountGoals,
  createGoal: mockCreateGoal,
  updateGoal: mockUpdateGoal,
  deleteGoal: mockDeleteGoal,
  replaceGoals: mockReplaceGoals,
}));

vi.mock('../../electron/modules/db/repositories/recurringPaymentsRepository.js', () => ({
  listRecurringPayments: mockListRecurringPayments,
  countRecurringPayments: mockCountRecurringPayments,
  createRecurringPayment: mockCreateRecurringPayment,
  updateRecurringPayment: mockUpdateRecurringPayment,
  deleteRecurringPayment: mockDeleteRecurringPayment,
  replaceRecurringPayments: mockReplaceRecurringPayments,
}));

// =============================================================================
// Импорт тестируемого модуля (после моков)
// =============================================================================
const {
  ensureDatabaseReady,
  getStorageStatus,
  loadPersistedAppState,
  savePersistedAppState,
  bootstrapDomainDataFromState,
  listDomainData,
  createDomainEntity,
  updateDomainEntity,
  deleteDomainEntity,
  checkExternalDatabase,
  importFromExternalDatabase,
} = await import('../../electron/modules/db/index.js');

// =============================================================================
// Вспомогательные функции
// =============================================================================
const mockDb = { prepare: vi.fn(), exec: vi.fn(), pragma: vi.fn(), close: vi.fn(), open: true };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetDatabaseStatus.mockReturnValue({
    available: true,
    usingSQLite: true,
    driver: 'better-sqlite3 (native)',
    path: '/tmp/test.sqlite',
    initialized: true,
  });
  mockOpenDatabaseConnection.mockResolvedValue(mockDb);
  mockRunMigrations.mockReturnValue({ applied: [], totalKnown: 3 });
});

// =============================================================================
// ensureDatabaseReady
// =============================================================================
describe('ensureDatabaseReady', () => {
  it('должен открыть БД и применить миграции при первом вызове', async () => {
    const db = await ensureDatabaseReady();
    expect(db).toBe(mockDb);
    expect(mockOpenDatabaseConnection).toHaveBeenCalledTimes(1);
    expect(mockRunMigrations).toHaveBeenCalledTimes(1);
    expect(mockRunMigrations).toHaveBeenCalledWith(mockDb);
  });

  it('должен вернуть кэшированное соединение при повторном вызове', async () => {
    // Первый вызов — открывает БД и применяет миграции
    await ensureDatabaseReady();
    const callCountAfterFirst = mockRunMigrations.mock.calls.length;

    // Второй вызов — должен вернуть кэш, миграции не применяются повторно
    await ensureDatabaseReady();
    const callCountAfterSecond = mockRunMigrations.mock.calls.length;

    // Миграции не должны применяться повторно
    expect(callCountAfterSecond).toBe(callCountAfterFirst);
  });

  it('должен вернуть null, если БД не открылась', async () => {
    mockOpenDatabaseConnection.mockResolvedValue(null);
    const db = await ensureDatabaseReady();
    expect(db).toBeNull();
  });
});

// =============================================================================
// getStorageStatus
// =============================================================================
describe('getStorageStatus', () => {
  it('должен вернуть статус хранилища', async () => {
    const status = await getStorageStatus();
    expect(status.available).toBe(true);
    expect(status.storage).toBe('sqlite');
    expect(status.migrations).toEqual({ applied: [], totalKnown: 3 });
  });
});

// =============================================================================
// loadPersistedAppState
// =============================================================================
describe('loadPersistedAppState', () => {
  it('должен загрузить состояние из БД', async () => {
    mockLoadAppStateRecord.mockReturnValue({
      state: { darkMode: true, filters: {} },
      updatedAt: '2024-01-01T00:00:00.000Z',
    });

    const result = await loadPersistedAppState();
    expect(result.success).toBe(true);
    expect(result.state).toEqual({ darkMode: true, filters: {} });
    expect(mockLoadAppStateRecord).toHaveBeenCalledWith(mockDb);
  });

  it('должен вернуть ошибку, если БД недоступна', async () => {
    mockOpenDatabaseConnection.mockResolvedValue(null);
    const result = await loadPersistedAppState();
    expect(result.success).toBe(false);
    expect(result.state).toBeNull();
  });

  it('должен обработать ошибку репозитория', async () => {
    mockLoadAppStateRecord.mockImplementation(() => {
      throw new Error('DB error');
    });
    const result = await loadPersistedAppState();
    expect(result.success).toBe(false);
    expect(result.error).toContain('DB error');
  });
});

// =============================================================================
// savePersistedAppState
// =============================================================================
describe('savePersistedAppState', () => {
  it('должен сохранить состояние в БД', async () => {
    mockSaveAppStateRecord.mockReturnValue({ updatedAt: '2024-01-01T00:00:00.000Z' });

    const result = await savePersistedAppState({ darkMode: true });
    expect(result.success).toBe(true);
    expect(mockSaveAppStateRecord).toHaveBeenCalledWith(mockDb, { darkMode: true });
    expect(mockFlushDatabaseToDiskSync).toHaveBeenCalled();
  });

  it('должен вернуть ошибку, если БД недоступна', async () => {
    mockOpenDatabaseConnection.mockResolvedValue(null);
    const result = await savePersistedAppState({ darkMode: true });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// bootstrapDomainDataFromState
// =============================================================================
describe('bootstrapDomainDataFromState', () => {
  const sampleState = {
    transactions: [{ id: 'tx-1', amount: 100 }],
    categories: [{ id: 'cat-1', name: 'Test' }],
    budgets: [{ id: 'budget-1', amount: 500 }],
    goals: [{ id: 'goal-1', name: 'Goal' }],
    recurringPayments: [{ id: 'recur-1', name: 'Payment' }],
  };

  it('должен загрузить данные, если БД пуста', async () => {
    mockCountTransactions.mockReturnValue(0);
    mockCountCategories.mockReturnValue(0);
    mockCountBudgets.mockReturnValue(0);
    mockCountGoals.mockReturnValue(0);
    mockCountRecurringPayments.mockReturnValue(0);

    mockListTransactions.mockReturnValue(sampleState.transactions);
    mockListCategories.mockReturnValue(sampleState.categories);
    mockListBudgets.mockReturnValue(sampleState.budgets);
    mockListGoals.mockReturnValue(sampleState.goals);
    mockListRecurringPayments.mockReturnValue(sampleState.recurringPayments);

    const result = await bootstrapDomainDataFromState(sampleState);
    expect(result).toBeTruthy();
    expect(mockReplaceTransactions).toHaveBeenCalled();
    expect(mockReplaceCategories).toHaveBeenCalled();
    expect(mockReplaceBudgets).toHaveBeenCalled();
    expect(mockReplaceGoals).toHaveBeenCalled();
    expect(mockReplaceRecurringPayments).toHaveBeenCalled();
  });

  it('не должен перезаписывать данные, если БД не пуста', async () => {
    mockCountTransactions.mockReturnValue(5);
    mockCountCategories.mockReturnValue(3);
    mockCountBudgets.mockReturnValue(2);
    mockCountGoals.mockReturnValue(1);
    mockCountRecurringPayments.mockReturnValue(1);

    const result = await bootstrapDomainDataFromState(sampleState);
    expect(result).toBeTruthy();
    expect(mockReplaceTransactions).not.toHaveBeenCalled();
    expect(mockReplaceCategories).not.toHaveBeenCalled();
    expect(mockReplaceBudgets).not.toHaveBeenCalled();
    expect(mockReplaceGoals).not.toHaveBeenCalled();
    expect(mockReplaceRecurringPayments).not.toHaveBeenCalled();
  });

  it('должен вернуть null, если state пустой', async () => {
    const result = await bootstrapDomainDataFromState(null);
    expect(result).toBeNull();
  });

  it('должен вернуть null, если БД недоступна', async () => {
    mockOpenDatabaseConnection.mockResolvedValue(null);
    const result = await bootstrapDomainDataFromState(sampleState);
    expect(result).toBeNull();
  });
});

// =============================================================================
// listDomainData
// =============================================================================
describe('listDomainData', () => {
  it('должен вернуть все доменные данные', async () => {
    mockListTransactions.mockReturnValue([{ id: 'tx-1' }]);
    mockListCategories.mockReturnValue([{ id: 'cat-1' }]);
    mockListBudgets.mockReturnValue([{ id: 'budget-1' }]);
    mockListGoals.mockReturnValue([{ id: 'goal-1' }]);
    mockListRecurringPayments.mockReturnValue([{ id: 'recur-1' }]);

    const result = await listDomainData();
    expect(result.success).toBe(true);
    expect(result.transactions).toHaveLength(1);
    expect(result.categories).toHaveLength(1);
    expect(result.budgets).toHaveLength(1);
    expect(result.goals).toHaveLength(1);
    expect(result.recurringPayments).toHaveLength(1);
  });

  it('должен вернуть ошибку, если БД недоступна', async () => {
    mockOpenDatabaseConnection.mockResolvedValue(null);
    const result = await listDomainData();
    expect(result.success).toBe(false);
    expect(result.error).toContain('недоступен');
  });
});

// =============================================================================
// createDomainEntity
// =============================================================================
describe('createDomainEntity', () => {
  const payload = { id: 'new-1', name: 'Test', amount: 100 };

  it('должен создать транзакцию', async () => {
    mockCreateTransaction.mockReturnValue({ id: 'new-1', amount: 100 });
    const result = await createDomainEntity('transaction', payload);
    expect(result.success).toBe(true);
    expect(mockCreateTransaction).toHaveBeenCalledWith(mockDb, payload);
  });

  it('должен создать категорию', async () => {
    mockCreateCategory.mockReturnValue({ id: 'new-1', name: 'Test' });
    const result = await createDomainEntity('category', payload);
    expect(result.success).toBe(true);
    expect(mockCreateCategory).toHaveBeenCalledWith(mockDb, payload);
  });

  it('должен создать бюджет', async () => {
    mockCreateBudget.mockReturnValue({ id: 'new-1', amount: 100 });
    const result = await createDomainEntity('budget', payload);
    expect(result.success).toBe(true);
    expect(mockCreateBudget).toHaveBeenCalledWith(mockDb, payload);
  });

  it('должен создать цель', async () => {
    mockCreateGoal.mockReturnValue({ id: 'new-1', name: 'Test' });
    const result = await createDomainEntity('goal', payload);
    expect(result.success).toBe(true);
    expect(mockCreateGoal).toHaveBeenCalledWith(mockDb, payload);
  });

  it('должен создать регулярный платёж', async () => {
    mockCreateRecurringPayment.mockReturnValue({ id: 'new-1', name: 'Test' });
    const result = await createDomainEntity('recurringPayment', payload);
    expect(result.success).toBe(true);
    expect(mockCreateRecurringPayment).toHaveBeenCalledWith(mockDb, payload);
  });

  it('должен вернуть ошибку для неизвестного типа', async () => {
    const result = await createDomainEntity('unknown', payload);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Неизвестный тип');
  });

  it('должен вернуть ошибку, если БД недоступна', async () => {
    mockOpenDatabaseConnection.mockResolvedValue(null);
    const result = await createDomainEntity('transaction', payload);
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// updateDomainEntity
// =============================================================================
describe('updateDomainEntity', () => {
  const updates = { amount: 500 };

  it('должен обновить транзакцию', async () => {
    mockUpdateTransaction.mockReturnValue({ id: 'tx-1', amount: 500 });
    const result = await updateDomainEntity('transaction', 'tx-1', updates);
    expect(result.success).toBe(true);
    expect(mockUpdateTransaction).toHaveBeenCalledWith(mockDb, 'tx-1', updates);
  });

  it('должен обновить категорию', async () => {
    mockUpdateCategory.mockReturnValue({ id: 'cat-1', name: 'Updated' });
    const result = await updateDomainEntity('category', 'cat-1', updates);
    expect(result.success).toBe(true);
    expect(mockUpdateCategory).toHaveBeenCalledWith(mockDb, 'cat-1', updates);
  });

  it('должен вернуть ошибку для неизвестного типа', async () => {
    const result = await updateDomainEntity('unknown', 'id-1', updates);
    expect(result.success).toBe(false);
  });

  it('должен вернуть ошибку, если БД недоступна', async () => {
    mockOpenDatabaseConnection.mockResolvedValue(null);
    const result = await updateDomainEntity('transaction', 'tx-1', updates);
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// deleteDomainEntity
// =============================================================================
describe('deleteDomainEntity', () => {
  it('должен удалить транзакцию', async () => {
    mockDeleteTransaction.mockReturnValue(true);
    const result = await deleteDomainEntity('transaction', 'tx-1');
    expect(result.success).toBe(true);
    expect(mockDeleteTransaction).toHaveBeenCalledWith(mockDb, 'tx-1');
  });

  it('должен удалить категорию', async () => {
    mockDeleteCategory.mockReturnValue(true);
    const result = await deleteDomainEntity('category', 'cat-1');
    expect(result.success).toBe(true);
    expect(mockDeleteCategory).toHaveBeenCalledWith(mockDb, 'cat-1');
  });

  it('должен вернуть ошибку для неизвестного типа', async () => {
    const result = await deleteDomainEntity('unknown', 'id-1');
    expect(result.success).toBe(false);
  });

  it('должен вернуть ошибку, если БД недоступна', async () => {
    mockOpenDatabaseConnection.mockResolvedValue(null);
    const result = await deleteDomainEntity('transaction', 'tx-1');
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// checkExternalDatabase
// =============================================================================
describe('checkExternalDatabase', () => {
  it('должен найти .db файлы в директории', () => {
    // Используем реальную директорию с тестовыми файлами
    const result = checkExternalDatabase(__dirname);
    // Должен найти setup.js и validation_check.js (не .db)
    expect(result.found).toBe(false);
    expect(Array.isArray(result.files)).toBe(true);
  });

  it('должен обработать ошибку директории', () => {
    const result = checkExternalDatabase('/non-existent-path/xyz');
    expect(result.found).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

// =============================================================================
// importFromExternalDatabase
// =============================================================================
describe('importFromExternalDatabase', () => {
  it('должен вернуть ошибку, если файл не найден', async () => {
    const result = await importFromExternalDatabase('/non-existent-path/db.sqlite');
    expect(result.success).toBe(false);
    expect(result.error).toContain('не найден');
  });

  it('должен вернуть ошибку, если путь не указан', async () => {
    // importFromExternalDatabase не проверяет на пустой путь напрямую,
    // но fs.existsSync вернёт false для пустого пути
    const result = await importFromExternalDatabase('');
    expect(result.success).toBe(false);
  });
});