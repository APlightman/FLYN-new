// CJS-точка входа для Electron 28+
// В CJS-модулях require('electron') работает корректно внутри Electron процесса
// Этот файл загружает ESM-модули через динамический import()

const electron = require('electron');

// Устанавливаем глобальные переменные для ESM-модулей
globalThis.__electron_app = electron.app;
globalThis.__electron_BrowserWindow = electron.BrowserWindow;
globalThis.__electron_dialog = electron.dialog;
globalThis.__electron_globalShortcut = electron.globalShortcut;
globalThis.__electron_ipcMain = electron.ipcMain;
globalThis.__electron_Menu = electron.Menu;
globalThis.__electron_Notification = electron.Notification;
globalThis.__electron_session = electron.session;
globalThis.__electron_shell = electron.shell;
globalThis.__electron_Tray = electron.Tray;

// Динамический импорт ESM-модуля main.js
import('./main.js').catch(err => {
  console.error('[main.cjs] Failed to load main.js:', err);
  process.exit(1);
});
