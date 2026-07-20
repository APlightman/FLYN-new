/**
 * Tests for ipcHandlers.js
 * Covers: setupIPC registration, all IPC channel handlers
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ipcMain, dialog, app, BrowserWindow } from '../../electron/modules/electronRuntime.js';

// =============================================================================
// Моки для зависимостей (ДО импорта тестируемого модуля)
// =============================================================================

const mockFsWriteFileSync = vi.fn();
const mockFsReadFileSync = vi.fn();

vi.mock('fs', () => ({
  default: {
    writeFileSync: mockFsWriteFileSync,
    readFileSync: mockFsReadFileSync,
    existsSync: vi.fn((path) => {
      if (path && typeof path === 'string' && path.includes('non-existent')) return false;
      return true;
    }),
  },
  writeFileSync: mockFsWriteFileSync,
  readFileSync: mockFsReadFileSync,
  existsSync: vi.fn((path) => {
    if (path && typeof path === 'string' && path.includes('non-existent')) return false;
    return true;
  }),
}));

// Мок для db/index.js
const mockGetStorageStatus = vi.fn();
const mockLoadPersistedAppState = vi.fn();
const mockSavePersistedAppState = vi.fn();
const mockBootstrapDomainDataFromState = vi.fn();
const mockListDomainData = vi.fn();
const mockCreateDomainEntity = vi.fn();
const mockUpdateDomainEntity = vi.fn();
const mockDeleteDomainEntity = vi.fn();
const mockCheckExternalDatabase = vi.fn();
const mockImportFromExternalDatabase = vi.fn();

vi.mock('../../electron/modules/db/index.js', () => ({
  getStorageStatus: mockGetStorageStatus,
  loadPersistedAppState: mockLoadPersistedAppState,
  savePersistedAppState: mockSavePersistedAppState,
  bootstrapDomainDataFromState: mockBootstrapDomainDataFromState,
  listDomainData: mockListDomainData,
  createDomainEntity: mockCreateDomainEntity,
  updateDomainEntity: mockUpdateDomainEntity,
  deleteDomainEntity: mockDeleteDomainEntity,
  checkExternalDatabase: mockCheckExternalDatabase,
  importFromExternalDatabase: mockImportFromExternalDatabase,
}));

// Мок для validation.js
const mockIsValidEntityType = vi.fn();
const mockValidateEntityPayload = vi.fn();
const mockValidateId = vi.fn();
const mockValidateUpdates = vi.fn();

vi.mock('../../electron/modules/validation.js', () => ({
  isValidEntityType: mockIsValidEntityType,
  validateEntityPayload: mockValidateEntityPayload,
  validateId: mockValidateId,
  validateUpdates: mockValidateUpdates,
}));

// =============================================================================
// Импорт тестируемого модуля
// =============================================================================
const { setupIPC } = await import('../../electron/modules/ipcHandlers.js');

// =============================================================================
// Вспомогательные функции
// =============================================================================
let ipcHandlers = {};
let mockMainWindow;
let mockUpdateTrayBadge;

beforeEach(() => {
  mockFsWriteFileSync.mockReset();
  mockFsReadFileSync.mockReset();
  vi.clearAllMocks();
  ipcHandlers = {};

  // Настраиваем ipcMain.handle для перехвата регистрации
  ipcMain.handle.mockImplementation((channel, handler) => {
    ipcHandlers[channel] = handler;
  });

  mockMainWindow = {
    isMinimized: vi.fn(() => false),
    restore: vi.fn(),
    show: vi.fn(),
    focus: vi.fn(),
  };

  mockUpdateTrayBadge = vi.fn();

  // Настраиваем dialog
  dialog.showSaveDialog.mockResolvedValue({ canceled: false, filePath: '/tmp/export.csv' });
  dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/tmp/import.csv'] });

  // Регистрируем обработчики
  setupIPC(mockMainWindow, mockUpdateTrayBadge);
});

// =============================================================================
// setupIPC — регистрация обработчиков
// =============================================================================
describe('setupIPC', () => {
  it('должен зарегистрировать все IPC-каналы', () => {
    const expectedHandlers = [
      'show-save-dialog',
      'show-open-dialog',
      'save-file',
      'export-pdf',
      'read-file',
      'show-notification',
      'update-tray-badge',
      'get-system-info',
      'storage:get-status',
      'storage:load-app-state',
      'storage:save-app-state',
      'storage:bootstrap-domain-data',
      'storage:list-domain-data',
      'storage:create-entity',
      'storage:update-entity',
      'storage:delete-entity',
      'storage:check-external-db',
      'storage:import-from-external',
    ];

    expectedHandlers.forEach((channel) => {
      expect(ipcHandlers[channel]).toBeDefined(`Handler ${channel} not registered`);
    });
  });
});

// =============================================================================
// Файловые операции
// =============================================================================
describe('show-save-dialog', () => {
  it('должен открыть диалог сохранения', async () => {
    const handler = ipcHandlers['show-save-dialog'];
    const result = await handler(null, {});
    expect(result).toEqual({ canceled: false, filePath: '/tmp/export.csv' });
  });
});

describe('show-open-dialog', () => {
  it('должен открыть диалог открытия файла', async () => {
    const handler = ipcHandlers['show-open-dialog'];
    const result = await handler(null, {});
    expect(result).toEqual({ canceled: false, filePaths: ['/tmp/import.csv'] });
  });
});

describe('save-file', () => {
  it('должен сохранить файл', async () => {
    mockFsWriteFileSync.mockReturnValue(undefined);
    const handler = ipcHandlers['save-file'];
    const result = await handler(null, '/tmp/test.txt', 'content');
    expect(result.success).toBe(true);
    expect(mockFsWriteFileSync).toHaveBeenCalledWith('/tmp/test.txt', 'content', 'utf8');
  });

  it('должен вернуть ошибку при неудачной записи', async () => {
    mockFsWriteFileSync.mockImplementation(() => { throw new Error('Permission denied'); });
    const handler = ipcHandlers['save-file'];
    const result = await handler(null, '/tmp/test.txt', 'content');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Permission denied');
  });

  it('должен объяснить, как сохранить файл, занятый другой программой', async () => {
    const error = new Error('EBUSY: resource busy or locked');
    error.code = 'EBUSY';
    mockFsWriteFileSync.mockImplementation(() => { throw error; });

    const handler = ipcHandlers['save-file'];
    const result = await handler(null, '/tmp/test.csv', 'content');

    expect(result).toEqual({
      success: false,
      error: 'Файл занят другой программой. Закройте его в Excel, Проводнике или другом приложении и повторите сохранение либо укажите другое имя.',
    });
  });
});

describe('export-pdf', () => {
  it('должен сформировать и сохранить PDF-файл', async () => {
    const handler = ipcHandlers['export-pdf'];
    const result = await handler(null, '/tmp/report.pdf', '<html><body>Report</body></html>');

    expect(result.success).toBe(true);
    expect(BrowserWindow).toHaveBeenCalled();
    expect(mockFsWriteFileSync).toHaveBeenCalledWith('/tmp/report.pdf', expect.any(Buffer));
  });

  it('должен отклонить путь не к PDF-файлу', async () => {
    const handler = ipcHandlers['export-pdf'];
    const result = await handler(null, '/tmp/report.txt', '<html><body>Report</body></html>');

    expect(result).toEqual({ success: false, error: 'Укажите путь к PDF-файлу' });
  });
});

describe('read-file', () => {
  it('должен прочитать файл', async () => {
    mockFsReadFileSync.mockReturnValue('file content');
    const handler = ipcHandlers['read-file'];
    const result = await handler(null, '/tmp/test.txt');
    expect(result.success).toBe(true);
    expect(result.content).toBe('file content');
  });

  it('должен вернуть ошибку при неудачном чтении', async () => {
    mockFsReadFileSync.mockImplementation(() => { throw new Error('File not found'); });
    const handler = ipcHandlers['read-file'];
    const result = await handler(null, '/tmp/non-existent.txt');
    expect(result.success).toBe(false);
    expect(result.error).toBe('File not found');
  });
});

// =============================================================================
// Уведомления
// =============================================================================
describe('show-notification', () => {
  it('должен показать уведомление', async () => {
    const handler = ipcHandlers['show-notification'];
    const result = await handler(null, { title: 'Test', body: 'Test body' });
    expect(result).toBe(true);
  });
});

describe('update-tray-badge', () => {
  it('должен обновить бейдж трея', async () => {
    const handler = ipcHandlers['update-tray-badge'];
    await handler(null, 5);
    expect(mockUpdateTrayBadge).toHaveBeenCalledWith(5);
  });
});

// =============================================================================
// Системная информация
// =============================================================================
describe('get-system-info', () => {
  it('должен вернуть информацию о системе', async () => {
    const handler = ipcHandlers['get-system-info'];
    const result = await handler();
    expect(result).toHaveProperty('platform');
    expect(result).toHaveProperty('arch');
    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('electronVersion');
    expect(result).toHaveProperty('nodeVersion');
    expect(result).toHaveProperty('chromeVersion');
    expect(result.version).toBe('1.0.0-test');
  });
});

// =============================================================================
// Хранилище
// =============================================================================
describe('storage:get-status', () => {
  it('должен вернуть статус хранилища', async () => {
    mockGetStorageStatus.mockResolvedValue({ available: true, storage: 'sqlite' });
    const handler = ipcHandlers['storage:get-status'];
    const result = await handler();
    expect(result).toEqual({ available: true, storage: 'sqlite' });
  });
});

describe('storage:load-app-state', () => {
  it('должен загрузить состояние', async () => {
    mockLoadPersistedAppState.mockResolvedValue({ success: true, state: { darkMode: true } });
    const handler = ipcHandlers['storage:load-app-state'];
    const result = await handler();
    expect(result.success).toBe(true);
    expect(result.state.darkMode).toBe(true);
  });
});

describe('storage:save-app-state', () => {
  it('должен сохранить состояние', async () => {
    mockSavePersistedAppState.mockResolvedValue({ success: true });
    const handler = ipcHandlers['storage:save-app-state'];
    const result = await handler(null, { darkMode: true });
    expect(result.success).toBe(true);
    expect(mockSavePersistedAppState).toHaveBeenCalledWith({ darkMode: true });
  });
});

describe('storage:bootstrap-domain-data', () => {
  it('должен загрузить доменные данные', async () => {
    mockBootstrapDomainDataFromState.mockResolvedValue({ transactions: [] });
    const handler = ipcHandlers['storage:bootstrap-domain-data'];
    const result = await handler(null, { transactions: [] });
    expect(mockBootstrapDomainDataFromState).toHaveBeenCalledWith({ transactions: [] });
  });
});

describe('storage:list-domain-data', () => {
  it('должен вернуть список доменных данных', async () => {
    mockListDomainData.mockResolvedValue({ success: true, transactions: [] });
    const handler = ipcHandlers['storage:list-domain-data'];
    const result = await handler();
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// CRUD с валидацией
// =============================================================================
describe('storage:create-entity', () => {
  const validPayload = { amount: 100, type: 'expense', category: 'Test', date: '2024-01-01' };

  it('должен создать сущность с валидными данными', async () => {
    mockIsValidEntityType.mockReturnValue(true);
    mockValidateEntityPayload.mockReturnValue({ isValid: true, sanitized: validPayload, errors: [] });
    mockCreateDomainEntity.mockResolvedValue({ success: true, item: { id: 'new-1' } });

    const handler = ipcHandlers['storage:create-entity'];
    const result = await handler(null, 'transaction', validPayload);
    expect(result.success).toBe(true);
    expect(mockValidateEntityPayload).toHaveBeenCalledWith('transaction', validPayload);
    expect(mockCreateDomainEntity).toHaveBeenCalledWith('transaction', validPayload);
  });

  it('должен отклонить неизвестный тип сущности', async () => {
    mockIsValidEntityType.mockReturnValue(false);
    const handler = ipcHandlers['storage:create-entity'];
    const result = await handler(null, 'unknown', validPayload);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Неизвестный тип');
  });

  it('должен отклонить невалидный payload', async () => {
    mockIsValidEntityType.mockReturnValue(true);
    mockValidateEntityPayload.mockReturnValue({
      isValid: false,
      sanitized: {},
      errors: ['Сумма обязательна'],
    });

    const handler = ipcHandlers['storage:create-entity'];
    const result = await handler(null, 'transaction', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('Ошибка валидации');
  });
});

describe('storage:update-entity', () => {
  it('должен обновить сущность с валидными данными', async () => {
    mockIsValidEntityType.mockReturnValue(true);
    mockValidateId.mockReturnValue(true);
    mockValidateUpdates.mockReturnValue({ isValid: true, sanitized: { amount: 500 }, errors: [] });
    mockUpdateDomainEntity.mockResolvedValue({ success: true, item: { id: 'tx-1', amount: 500 } });

    const handler = ipcHandlers['storage:update-entity'];
    const result = await handler(null, 'transaction', 'tx-1', { amount: 500 });
    expect(result.success).toBe(true);
  });

  it('должен отклонить невалидный ID', async () => {
    mockIsValidEntityType.mockReturnValue(true);
    mockValidateId.mockReturnValue(false);

    const handler = ipcHandlers['storage:update-entity'];
    const result = await handler(null, 'transaction', '', { amount: 500 });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Неверный идентификатор');
  });

  it('должен отклонить невалидные обновления', async () => {
    mockIsValidEntityType.mockReturnValue(true);
    mockValidateId.mockReturnValue(true);
    mockValidateUpdates.mockReturnValue({
      isValid: false,
      sanitized: {},
      errors: ['Нет полей для обновления'],
    });

    const handler = ipcHandlers['storage:update-entity'];
    const result = await handler(null, 'transaction', 'tx-1', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('Ошибка валидации обновлений');
  });
});

describe('storage:delete-entity', () => {
  it('должен удалить сущность', async () => {
    mockIsValidEntityType.mockReturnValue(true);
    mockValidateId.mockReturnValue(true);
    mockDeleteDomainEntity.mockResolvedValue({ success: true });

    const handler = ipcHandlers['storage:delete-entity'];
    const result = await handler(null, 'transaction', 'tx-1');
    expect(result.success).toBe(true);
  });

  it('должен отклонить невалидный тип', async () => {
    mockIsValidEntityType.mockReturnValue(false);
    const handler = ipcHandlers['storage:delete-entity'];
    const result = await handler(null, 'unknown', 'id-1');
    expect(result.success).toBe(false);
  });

  it('должен отклонить невалидный ID', async () => {
    mockIsValidEntityType.mockReturnValue(true);
    mockValidateId.mockReturnValue(false);
    const handler = ipcHandlers['storage:delete-entity'];
    const result = await handler(null, 'transaction', '');
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// Импорт из внешней БД
// =============================================================================
describe('storage:check-external-db', () => {
  it('должен проверить внешнюю БД с переданным путём', async () => {
    mockCheckExternalDatabase.mockReturnValue({ found: true, files: ['test.db'] });
    const handler = ipcHandlers['storage:check-external-db'];
    const result = await handler(null, '/custom/path');
    expect(mockCheckExternalDatabase).toHaveBeenCalledWith('/custom/path');
    expect(result.found).toBe(true);
  });

  it('должен использовать путь по умолчанию, если путь не передан', async () => {
    mockCheckExternalDatabase.mockReturnValue({ found: false, files: [] });
    const handler = ipcHandlers['storage:check-external-db'];
    const result = await handler(null, undefined);
    expect(mockCheckExternalDatabase).toHaveBeenCalledWith('C:\\SQLite');
    expect(result.found).toBe(false);
  });
});

describe('storage:import-from-external', () => {
  it('должен импортировать из внешней БД', async () => {
    mockImportFromExternalDatabase.mockResolvedValue({
      success: true,
      imported: { transactions: 5, categories: 3 },
    });
    const handler = ipcHandlers['storage:import-from-external'];
    const result = await handler(null, '/path/to/external.db');
    expect(result.success).toBe(true);
    expect(result.imported.transactions).toBe(5);
  });

  it('должен вернуть ошибку, если путь не указан', async () => {
    const handler = ipcHandlers['storage:import-from-external'];
    const result = await handler(null, null);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Не указан путь');
  });
});
