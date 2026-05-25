import fs from 'fs';
import pkg from 'electron-updater';
import { ipcMain, dialog, Notification, app } from './electronRuntime.js';
import { getIconPath } from './windowManager.js';
import {
  bootstrapDomainDataFromState,
  createDomainEntity,
  deleteDomainEntity,
  getStorageStatus,
  listDomainData,
  loadPersistedAppState,
  savePersistedAppState,
  updateDomainEntity,
} from './db/index.js';

const getAutoUpdater = () => {
  if (!app.isPackaged) {
    return null;
  }

  try {
    return pkg.autoUpdater;
  } catch (error) {
    console.warn('AutoUpdater unavailable in current runtime:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

const setupIPC = (mainWindow, updateTrayBadge) => {
  ipcMain.on('restart-app', () => {
    const autoUpdater = getAutoUpdater();
    if (autoUpdater) {
      autoUpdater.quitAndInstall();
    }
  });
  ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Сохранить экспорт',
      defaultPath: options.defaultPath || 'export.csv',
      filters: options.filters || [
        { name: 'CSV файлы', extensions: ['csv'] },
        { name: 'Excel файлы', extensions: ['xlsx', 'xls'] },
        { name: 'Все файлы', extensions: ['*'] }
      ]
    });
    return result;
  });

  ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Выберите файл для импорта',
      filters: options.filters || [
        { name: 'CSV файлы', extensions: ['csv'] },
        { name: 'Excel файлы', extensions: ['xlsx', 'xls'] },
        { name: 'Все файлы', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    return result;
  });

  ipcMain.handle('save-file', async (event, filePath, content) => {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('show-notification', (event, options) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title || 'FinanceTracker',
        body: options.body,
        icon: getIconPath(),
        silent: options.silent || false
      });
      
      notification.show();
      
      if (options.onClick) {
        notification.on('click', () => {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        });
      }
      
      return true;
    }
    return false;
  });

  ipcMain.handle('update-tray-badge', (event, count) => {
    if (updateTrayBadge) {
      updateTrayBadge(count);
    }
  });

  ipcMain.handle('get-system-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome
    };
  });

  ipcMain.handle('storage:get-status', () => {
    return getStorageStatus();
  });

  ipcMain.handle('storage:load-app-state', () => {
    return loadPersistedAppState();
  });

  ipcMain.handle('storage:save-app-state', (event, state) => {
    return savePersistedAppState(state);
  });

  ipcMain.handle('storage:bootstrap-domain-data', (event, state) => {
    return bootstrapDomainDataFromState(state);
  });

  ipcMain.handle('storage:list-domain-data', () => {
    return listDomainData();
  });

  ipcMain.handle('storage:create-entity', (event, entityType, payload) => {
    return createDomainEntity(entityType, payload);
  });

  ipcMain.handle('storage:update-entity', (event, entityType, id, updates) => {
    return updateDomainEntity(entityType, id, updates);
  });

  ipcMain.handle('storage:delete-entity', (event, entityType, id) => {
    return deleteDomainEntity(entityType, id);
  });
};

export { setupIPC };
