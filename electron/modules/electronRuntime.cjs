// CJS-версия electronRuntime для Electron 28+
// В CJS-модулях require('electron') работает корректно внутри Electron процесса
const electron = require('electron');

const {
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
} = electron;

module.exports = {
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
module.exports.default = electron;
