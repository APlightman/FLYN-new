import { Menu, shell, dialog, app } from 'electron';
import { showMainWindow } from './trayManager.js';

const isMac = process.platform === 'darwin';

const showHotkeysDialog = (mainWindow) => {
  const message = `Горячие клавиши FinanceTracker:

🎯 Навигация:
Ctrl+1 - Главная панель
Ctrl+2 - Транзакции
Ctrl+3 - Бюджет
Ctrl+4 - Финансовые цели
Ctrl+5 - Аналитика

💰 Быстрые действия:
Ctrl+N - Добавить транзакцию
Ctrl+Shift+I - Добавить доход
Ctrl+Shift+E - Добавить расход

📊 Данные:
Ctrl+E - Экспорт данных
Ctrl+I - Импорт данных`;

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Горячие клавиши',
    message: 'Горячие клавиши FinanceTracker',
    detail: message,
    buttons: ['OK']
  });
};

const showAboutDialog = (mainWindow) => {
  const message = `FinanceTracker Desktop v1.0.0

Современное приложение для управления личными финансами
с умным бюджетированием и аналитикой.

🔥 Особенности:
• Firebase синхронизация
• Оффлайн режим
• Конвертная система бюджетирования
• Финансовые калькуляторы
• Импорт/экспорт данных

© 2024 FinanceTracker Team`;

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'О программе FinanceTracker',
    message: 'О программе FinanceTracker',
    detail: message,
    buttons: ['OK']
  });
};

const createApplicationMenu = (mainWindow) => {
  const template = [
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'О программе FinanceTracker' },
        { type: 'separator' },
        { role: 'services', label: 'Службы' },
        { type: 'separator' },
        { role: 'hide', label: 'Скрыть FinanceTracker' },
        { role: 'hideothers', label: 'Скрыть остальные' },
        { role: 'unhide', label: 'Показать все' },
        { type: 'separator' },
        { role: 'quit', label: 'Выйти из FinanceTracker' }
      ]
    }] : []),
    {
      label: 'Файл',
      submenu: [
        {
          label: 'Добавить транзакцию',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            showMainWindow(mainWindow);
            mainWindow.webContents.send('quick-action', 'add-transaction');
          }
        },
        { type: 'separator' },
        {
          label: 'Экспорт данных',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            showMainWindow(mainWindow);
            mainWindow.webContents.send('navigate-to', 'import-export');
          }
        },
        {
          label: 'Импорт данных',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            showMainWindow(mainWindow);
            mainWindow.webContents.send('show-import');
          }
        },
        { type: 'separator' },
        ...(!isMac ? [{ role: 'quit', label: 'Выход' }] : [])
      ]
    },
    {
      label: 'Правка',
      submenu: [
        { role: 'undo', label: 'Отменить' },
        { role: 'redo', label: 'Повторить' },
        { type: 'separator' },
        { role: 'cut', label: 'Вырезать' },
        { role: 'copy', label: 'Копировать' },
        { role: 'paste', label: 'Вставить' },
        { role: 'selectall', label: 'Выделить все' }
      ]
    },
    {
      label: 'Финансы',
      submenu: [
        {
          label: 'Главная панель',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            showMainWindow(mainWindow);
            mainWindow.webContents.send('navigate-to', 'dashboard');
          }
        },
        {
          label: 'Транзакции',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            showMainWindow(mainWindow);
            mainWindow.webContents.send('navigate-to', 'transactions');
          }
        },
        {
          label: 'Бюджет',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            showMainWindow(mainWindow);
            mainWindow.webContents.send('navigate-to', 'budget');
          }
        },
        {
          label: 'Финансовые цели',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            showMainWindow(mainWindow);
            mainWindow.webContents.send('navigate-to', 'goals');
          }
        },
        {
          label: 'Аналитика',
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            showMainWindow(mainWindow);
            mainWindow.webContents.send('navigate-to', 'analytics');
          }
        }
      ]
    },
    {
      label: 'Справка',
      submenu: [
        {
          label: 'Горячие клавиши',
          click: () => showHotkeysDialog(mainWindow)
        },
        { type: 'separator' },
        {
          label: 'Сайт проекта',
          click: () => shell.openExternal('https://financetracker.com')
        },
        ...(!isMac ? [{
          type: 'separator'
        }, {
          label: 'О программе',
          click: () => showAboutDialog(mainWindow)
        }] : [])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

export { createApplicationMenu, showHotkeysDialog, showAboutDialog };
