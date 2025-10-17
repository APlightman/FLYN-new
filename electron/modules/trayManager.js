import { Menu, Tray, app } from 'electron';
import { getIconPath } from './windowManager.js';

const showMainWindow = (mainWindow) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    if (process.platform === 'darwin') app.dock.show();
  }
};

const createTray = (mainWindow) => {
  try {
    const tray = new Tray(getIconPath());
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Показать FinanceTracker',
        click: () => showMainWindow(mainWindow)
      },
      { type: 'separator' },
      {
        label: 'Быстрые действия',
        submenu: [
          {
            label: 'Добавить доход',
            accelerator: 'CmdOrCtrl+Shift+I',
            click: () => {
              showMainWindow(mainWindow);
              mainWindow.webContents.send('quick-action', 'add-income');
            }
          },
          {
            label: 'Добавить расход',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => {
              showMainWindow(mainWindow);
              mainWindow.webContents.send('quick-action', 'add-expense');
            }
          },
          {
            label: 'Посмотреть бюджет',
            accelerator: 'CmdOrCtrl+Shift+B',
            click: () => {
              showMainWindow(mainWindow);
              mainWindow.webContents.send('navigate-to', 'budget');
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Настройки',
        click: () => {
          showMainWindow(mainWindow);
          mainWindow.webContents.send('navigate-to', 'settings');
        }
      },
      {
        label: 'Экспорт данных',
        click: () => {
          showMainWindow(mainWindow);
          mainWindow.webContents.send('navigate-to', 'import-export');
        }
      },
      { type: 'separator' },
      {
        label: 'Выход',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          // We'll handle the isQuitting flag differently to avoid circular dependency
          app.quit();
        }
      }
    ]);

    tray.setToolTip('FinanceTracker - Управление финансами');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
      showMainWindow(mainWindow);
    });

    return tray;
  } catch (error) {
    console.warn('Не удалось создать иконку в трее:', error.message);
    console.warn('Приложение продолжит работу без иконки в трее.');
    return null;
  }
};

export { createTray, showMainWindow };
