import { useEffect, useCallback, useState } from 'react';

interface ElectronAPI {
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  showNotification: (options: any) => Promise<boolean>;
  updateTrayBadge: (count: number) => Promise<void>;
  getSystemInfo: () => Promise<any>;
  onQuickAction: (callback: (action: string) => void) => void;
  onNavigateTo: (callback: (route: string) => void) => void;
  onShowImport: (callback: () => void) => void;
  onDeepLink: (callback: (url: string) => void) => void;
  onUpdateAvailable: (callback: (info: any) => void) => void;
  onUpdateDownloaded: (callback: (info: any) => void) => void;
  onDownloadProgress: (callback: (progress: any) => void) => void;
  removeAllListeners: (channel: string) => void;
  platform: string;
  isElectron: boolean;
  versions: {
    electron: string;
    node: string;
    chrome: string;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectronIntegration() {
  const [isElectron, setIsElectron] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [updateInfo, setUpdateInfo] = useState<{
    available: boolean;
    downloaded: boolean;
    progress?: number;
    info?: any;
  }>({
    available: false,
    downloaded: false
  });

  useEffect(() => {
    const electronAPI = window.electronAPI;
    if (electronAPI) {
      setIsElectron(true);
      
      // Получаем системную информацию
      electronAPI.getSystemInfo().then(setSystemInfo);
      
      // Настраиваем обработчики обновлений
      electronAPI.onUpdateAvailable((info) => {
        setUpdateInfo(prev => ({ ...prev, available: true, info }));
      });

      electronAPI.onUpdateDownloaded((info) => {
        setUpdateInfo(prev => ({ ...prev, downloaded: true, info }));
      });

      electronAPI.onDownloadProgress((progress) => {
        setUpdateInfo(prev => ({ ...prev, progress: progress.percent }));
      });
    }

    return () => {
      if (electronAPI) {
        electronAPI.removeAllListeners('update-available');
        electronAPI.removeAllListeners('update-downloaded');
        electronAPI.removeAllListeners('download-progress');
      }
    };
  }, []);

  const showSaveDialog = useCallback(async (options: {
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => {
    if (!window.electronAPI) return null;
    return await window.electronAPI.showSaveDialog(options);
  }, []);

  const showOpenDialog = useCallback(async (options: {
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => {
    if (!window.electronAPI) return null;
    return await window.electronAPI.showOpenDialog(options);
  }, []);

  const saveFile = useCallback(async (filePath: string, content: string) => {
    if (!window.electronAPI) return { success: false, error: 'Electron API недоступен' };
    return await window.electronAPI.saveFile(filePath, content);
  }, []);

  const readFile = useCallback(async (filePath: string) => {
    if (!window.electronAPI) return { success: false, error: 'Electron API недоступен' };
    return await window.electronAPI.readFile(filePath);
  }, []);

  const showNotification = useCallback(async (options: {
    title?: string;
    body: string;
    silent?: boolean;
    onClick?: boolean;
  }) => {
    if (!window.electronAPI) {
      // Fallback для веб-версии
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(options.title || 'FinanceTracker', {
          body: options.body,
          icon: '/icons/icon-192x192.png',
          silent: options.silent
        });
        return true;
      }
      return false;
    }
    return await window.electronAPI.showNotification(options);
  }, []);

  const updateTrayBadge = useCallback(async (count: number) => {
    if (!window.electronAPI) return;
    await window.electronAPI.updateTrayBadge(count);
  }, []);

  const setupElectronListeners = useCallback((callbacks: {
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
  }, []);

  return {
    isElectron,
    systemInfo,
    updateInfo,
    showSaveDialog,
    showOpenDialog,
    saveFile,
    readFile,
    showNotification,
    updateTrayBadge,
    setupElectronListeners
  };
}

// Утилита для проверки Electron окружения
export const isElectronApp = (): boolean => {
  return !!(window.electronAPI?.isElectron);
};

// Утилита для получения информации о платформе
export const getPlatformInfo = () => {
  if (window.electronAPI) {
    return {
      platform: window.electronAPI.platform,
      isElectron: true,
      versions: window.electronAPI.versions
    };
  }
  
  return {
    platform: 'web',
    isElectron: false,
    versions: {
      userAgent: navigator.userAgent
    }
  };
};
