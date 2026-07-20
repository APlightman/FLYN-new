/**
 * Setup file for Electron module tests using Vitest.
 * Provides mocks for better-sqlite3, Electron runtime, and electron-updater.
 */
import { vi } from 'vitest';

// ===== Mock better-sqlite3 =====
const mockDbInstance = {
  prepare: () => ({
    run: () => ({ changes: 1, lastInsertRowid: 1 }),
    get: () => null,
    all: () => [],
  }),
  exec: () => {},
  pragma: () => {},
  close: () => {},
  transaction: (fn) => {
    const tx = (...args) => fn(...args);
    tx.deferred = () => {};
    tx.immediate = () => {};
    tx.exclusive = () => {};
    return tx;
  },
  open: true,
};

const mockBetterSqlite3 = vi.fn(() => mockDbInstance);
mockBetterSqlite3.prototype = {};
mockBetterSqlite3.default = mockBetterSqlite3;

vi.mock('better-sqlite3', () => ({ default: mockBetterSqlite3 }));

// ===== Mock electronRuntime =====
vi.mock('../../electron/modules/electronRuntime.js', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-data/financetracker'),
    getVersion: vi.fn(() => '1.0.0-test'),
    isPackaged: false,
    requestSingleInstanceLock: () => true,
    quit: vi.fn(),
    setAsDefaultProtocolClient: () => true,
    on: vi.fn(),
    whenReady: () => Promise.resolve(),
    getAppPath: () => '/tmp/test-app',
    getName: () => 'FinanceTracker',
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    webContents: {
      openDevTools: vi.fn(),
      send: vi.fn(),
      on: vi.fn(),
      printToPDF: vi.fn().mockResolvedValue(Buffer.from('%PDF-1.4 test')),
    },
    on: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    close: vi.fn(),
    focus: vi.fn(),
    minimize: vi.fn(),
    restore: vi.fn(),
    isMinimized: () => false,
    isVisible: () => true,
    isDestroyed: () => false,
    destroy: vi.fn(),
    setMenu: vi.fn(),
    setTitle: vi.fn(),
    getBounds: () => ({ x: 0, y: 0, width: 1200, height: 800 }),
    setBounds: vi.fn(),
    center: vi.fn(),
  })),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
    send: vi.fn(),
  },
  dialog: {
    showSaveDialog: vi.fn().mockResolvedValue({ canceled: false, filePath: '/tmp/test-export.csv' }),
    showOpenDialog: vi.fn().mockResolvedValue({ canceled: false, filePaths: ['/tmp/test-import.csv'] }),
  },
  Notification: Object.assign(
    vi.fn().mockImplementation(() => ({
      show: vi.fn(),
      on: vi.fn(),
    })),
    { isSupported: () => true }
  ),
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  session: {
    defaultSession: {
      webRequest: {
        onHeadersReceived: vi.fn(),
      },
    },
  },
  screen: {
    getPrimaryDisplay: () => ({
      workArea: { width: 1920, height: 1080 },
    }),
  },
  Menu: {
    buildFromTemplate: () => ({ popup: vi.fn() }),
    setApplicationMenu: vi.fn(),
  },
  Tray: vi.fn().mockImplementation(() => ({
    setToolTip: vi.fn(),
    setContextMenu: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
    displayBalloon: vi.fn(),
  })),
  globalShortcut: {
    register: vi.fn(),
    unregisterAll: vi.fn(),
  },
  nativeImage: {
    createFromPath: () => ({
      resize: () => ({ toDataURL: () => 'data:image/png;base64,' }),
    }),
  },
  shell: {
    openPath: vi.fn(),
    openExternal: vi.fn(),
  },
}));

// ===== Mock electron-updater =====
vi.mock('electron-updater', () => ({
  autoUpdater: {
    checkForUpdates: vi.fn(),
    checkForUpdatesAndNotify: vi.fn(),
    on: vi.fn(),
    quitAndInstall: vi.fn(),
    downloadUpdate: vi.fn(),
    setFeedURL: vi.fn(),
    channel: 'latest',
    currentVersion: { version: '1.0.0-test' },
  },
}));

// ===== Mock fs for file operations =====
vi.mock('fs', async () => {
  const actualFs = await vi.importActual('fs');
  return {
    ...actualFs,
    existsSync: vi.fn((path) => {
      if (typeof path === 'string' && path.includes('non-existent')) return false;
      if (typeof path === 'string' && path.includes('empty-dir')) return true;
      return actualFs.existsSync(path);
    }),
    readdirSync: vi.fn((path) => {
      if (typeof path === 'string' && path.includes('empty-dir')) return [];
      if (typeof path === 'string' && path.includes('external-db')) return ['test.db', 'data.sqlite'];
      return actualFs.readdirSync(path);
    }),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn((path, encoding) => {
      if (typeof path === 'string' && path.endsWith('.sql')) return '-- test migration SQL';
      return actualFs.readFileSync(path, encoding);
    }),
    mkdirSync: vi.fn(),
  };
});
