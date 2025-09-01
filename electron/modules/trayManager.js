const { Menu, Tray, app } = require('electron');
const { getIconPath } = require('./windowManager');

const showMainWindow = (mainWindow) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    if (process.platform === 'darwin') app.dock.show();
  }
};

const createTray = (mainWindow) => {
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
        const { isQuitting } = require('../main');
        isQuitting = true;
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
};

module.exports = { createTray, showMainWindow };
