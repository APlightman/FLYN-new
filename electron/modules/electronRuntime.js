import { createRequire } from 'module';

const require = createRequire(import.meta.url);
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

export default electron;
