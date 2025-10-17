import { ipcMain, dialog, Notification, app } from 'electron';
import fs from 'fs';
import pkg from 'electron-updater';
import { getIconPath } from './windowManager.js';

const { autoUpdater } = pkg;

const setupIPC = (mainWindow, updateTrayBadge) => {
  ipcMain.on('restart-app', () => {
    autoUpdater.quitAndInstall();
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
};

export { setupIPC };
