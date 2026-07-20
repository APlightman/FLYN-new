// Electron 28+ ESM support
// Этот модуль экспортирует заглушки для Electron API.
// Реальный electron импортируется в main.js и передаётся через глобальную переменную.
// Это необходимо, т.к. createRequire не может загрузить electron как встроенный модуль.

// Заглушки по умолчанию (используются в тестах, где electron замокан)
const app = globalThis.__electron_app || {};
const BrowserWindow = globalThis.__electron_BrowserWindow || {};
const dialog = globalThis.__electron_dialog || {};
const globalShortcut = globalThis.__electron_globalShortcut || {};
const ipcMain = globalThis.__electron_ipcMain || {};
const Menu = globalThis.__electron_Menu || {};
const Notification = globalThis.__electron_Notification || (function() {});
const session = globalThis.__electron_session || {};
const shell = globalThis.__electron_shell || {};
const Tray = globalThis.__electron_Tray || (function() {});

export {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  Notification,
  session,
  shell,
  Tray,
};

export default { app, BrowserWindow, dialog, globalShortcut, ipcMain, Menu, Notification, session, shell, Tray };
