import { useEffect, useCallback, useState } from "react";
import type {
  AppState,
  Budget,
  Category,
  FinancialGoal,
  RecurringPayment,
  Transaction,
} from "../types";

interface ElectronAPI {
  showSaveDialog: (options: Record<string, unknown>) => Promise<{ canceled: boolean; filePath?: string }>;
  showOpenDialog: (options: Record<string, unknown>) => Promise<{ canceled: boolean; filePaths: string[] }>;
  saveFile: (
    filePath: string,
    content: string,
  ) => Promise<{ success: boolean; error?: string }>;
  exportPdf: (
    filePath: string,
    html: string,
  ) => Promise<{ success: boolean; error?: string }>;
  readFile: (
    filePath: string,
  ) => Promise<{ success: boolean; content?: string; error?: string }>;
  showNotification: (options: Record<string, unknown>) => Promise<boolean>;
  updateTrayBadge: (count: number) => Promise<void>;
  getSystemInfo: () => Promise<SystemInfo>;
  getStorageStatus: () => Promise<StorageInfo>;
  loadAppState: () => Promise<{
    success?: boolean;
    state?: Partial<AppState>;
    error?: string;
    status?: unknown;
  }>;
  saveAppState: (state: unknown) => Promise<{
    success: boolean;
    error?: string;
    status?: { storage?: string } & Record<string, unknown>;
  }>;
  bootstrapDomainData: (state: unknown) => Promise<{ success: boolean; error?: string }>;
  listDomainData: () => Promise<DomainData>;
  createEntity: (entityType: string, payload: unknown) => Promise<{ success: boolean; id?: string; item?: unknown; error?: string }>;
  updateEntity: (entityType: string, id: string, updates: unknown) => Promise<{ success: boolean; item?: unknown; error?: string }>;
  deleteEntity: (entityType: string, id: string) => Promise<{ success: boolean; error?: string }>;
  checkExternalDatabase: (
    directoryPath?: string,
  ) => Promise<{
    found: boolean;
    files: string[];
    defaultPath: string;
    error?: string;
  }>;
  importFromExternalDatabase: (
    sourcePath: string,
  ) => Promise<{
    success: boolean;
    imported: {
      transactions: number;
      categories: number;
      budgets: number;
      goals: number;
      recurringPayments: number;
      appState: boolean;
    };
    error?: string;
    errors?: string[];
  }>;
  onQuickAction: (callback: (action: string) => void) => void;
  onNavigateTo: (callback: (route: string) => void) => void;
  onShowImport: (callback: () => void) => void;
  onDeepLink: (callback: (url: string) => void) => void;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => void;
  restartApp: () => void;
  removeAllListeners: (channel: string) => void;
  getCloseBehavior: () => Promise<"exit" | "minimize-to-tray">;
  setCloseBehavior: (behavior: "exit" | "minimize-to-tray") => Promise<void>;
  platform: string;
  isElectron: boolean;
  versions: {
    electron: string;
    node: string;
    chrome: string;
  };
}

interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
}

interface StorageInfo {
  storage?: "sqlite" | "renderer-localStorage" | string;
  available?: boolean;
  path?: string;
  error?: string | null;
  dbPath?: string;
  dbSize?: number;
  tableCount?: number;
}

interface DomainData {
  transactions?: Transaction[];
  categories?: Category[];
  budgets?: Budget[];
  goals?: FinancialGoal[];
  recurringPayments?: RecurringPayment[];
  appState?: unknown;
  success?: boolean;
  error?: string;
}

interface UpdateInfo {
  version?: string;
  releaseDate?: string;
}

interface DownloadProgress {
  percent?: number;
  transferred?: number;
  total?: number;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectronIntegration() {
  const [isElectron, setIsElectron] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{
    available: boolean;
    downloaded: boolean;
    progress?: number;
    info?: UpdateInfo;
  }>({
    available: false,
    downloaded: false,
  });

  useEffect(() => {
    const electronAPI = window.electronAPI;
    if (electronAPI) {
      setIsElectron(true);

      // Получаем системную информацию
      electronAPI.getSystemInfo().then(setSystemInfo);
      electronAPI
        .getStorageStatus?.()
        .then(setStorageInfo)
        .catch(() => null);

      // Настраиваем обработчики обновлений
      electronAPI.onUpdateAvailable((info) => {
        setUpdateInfo((prev) => ({ ...prev, available: true, info }));
      });

      electronAPI.onUpdateDownloaded((info) => {
        setUpdateInfo((prev) => ({ ...prev, downloaded: true, info }));
      });

      electronAPI.onDownloadProgress((progress) => {
        setUpdateInfo((prev) => ({ ...prev, progress: progress.percent }));
      });
    }

    return () => {
      if (electronAPI) {
        electronAPI.removeAllListeners("update-available");
        electronAPI.removeAllListeners("update-downloaded");
        electronAPI.removeAllListeners("download-progress");
      }
    };
  }, []);

  const showSaveDialog = useCallback(
    async (options: {
      defaultPath?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => {
      if (!window.electronAPI) return null;
      return await window.electronAPI.showSaveDialog(options);
    },
    [],
  );

  const showOpenDialog = useCallback(
    async (options: {
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => {
      if (!window.electronAPI) return null;
      return await window.electronAPI.showOpenDialog(options);
    },
    [],
  );

  const saveFile = useCallback(async (filePath: string, content: string) => {
    if (!window.electronAPI)
      return { success: false, error: "Electron API недоступен" };
    return await window.electronAPI.saveFile(filePath, content);
  }, []);

  const exportPdf = useCallback(async (filePath: string, html: string) => {
    if (!window.electronAPI)
      return { success: false, error: "Electron API недоступен" };
    return await window.electronAPI.exportPdf(filePath, html);
  }, []);

  const readFile = useCallback(async (filePath: string) => {
    if (!window.electronAPI)
      return { success: false, error: "Electron API недоступен" };
    return await window.electronAPI.readFile(filePath);
  }, []);

  const showNotification = useCallback(
    async (options: {
      title?: string;
      body: string;
      silent?: boolean;
      onClick?: boolean;
    }) => {
      if (!window.electronAPI) {
        // Fallback для веб-версии
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(options.title || "FinanceTracker", {
            body: options.body,
            icon: "/icons/icon-192x192.png",
            silent: options.silent,
          });
          return true;
        }
        return false;
      }
      return await window.electronAPI.showNotification(options);
    },
    [],
  );

  const updateTrayBadge = useCallback(async (count: number) => {
    if (!window.electronAPI) return;
    await window.electronAPI.updateTrayBadge(count);
  }, []);

  const setupElectronListeners = useCallback(
    (callbacks: {
      onQuickAction?: (action: string) => void;
      onNavigateTo?: (route: string) => void;
      onShowImport?: () => void;
      onDeepLink?: (url: string) => void;
    }) => {
      if (!window.electronAPI) return;

      if (callbacks.onQuickAction) {
        window.electronAPI.onQuickAction(callbacks.onQuickAction);
      }
      if (callbacks.onNavigateTo) {
        window.electronAPI.onNavigateTo(callbacks.onNavigateTo);
      }
      if (callbacks.onShowImport) {
        window.electronAPI.onShowImport(callbacks.onShowImport);
      }
      if (callbacks.onDeepLink) {
        window.electronAPI.onDeepLink(callbacks.onDeepLink);
      }
    },
    [],
  );

  return {
    isElectron,
    systemInfo,
    storageInfo,
    updateInfo,
    showSaveDialog,
    showOpenDialog,
    saveFile,
    exportPdf,
    readFile,
    showNotification,
    updateTrayBadge,
    setupElectronListeners,
  };
}

// Утилита для проверки Electron окружения
export const isElectronApp = (): boolean => {
  return !!window.electronAPI?.isElectron;
};

// Утилита для получения информации о платформе
export const getPlatformInfo = () => {
  if (window.electronAPI) {
    return {
      platform: window.electronAPI.platform,
      isElectron: true,
      versions: window.electronAPI.versions,
    };
  }

  return {
    platform: "web",
    isElectron: false,
    versions: {
      userAgent: navigator.userAgent,
    },
  };
};
