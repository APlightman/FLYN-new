const { app, BrowserWindow } = require('electron');
const path = require('path');
const { createMainWindow } = require('./modules/windowManager');
const { createTray } = require('./modules/trayManager');
const { createApplicationMenu } = require('./modules/menuManager');
const { setupIPC } = require('./modules/ipcHandlers');
const { setupAutoUpdater } = require('./modules/autoUpdater');
const { registerGlobalShortcuts } = require('./modules/shortcuts');

const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

let mainWindow;
let tray;
let isQuitting = false;

const initializeApp = () => {
  mainWindow = createMainWindow(isDev);
  tray = createTray(mainWindow, isQuitting);
  createApplicationMenu(mainWindow);
  setupIPC(mainWindow);
  setupAutoUpdater(mainWindow);
  registerGlobalShortcuts(mainWindow);
  
  if (isMac && process.argv.includes('--hidden')) {
    app.dock.hide();
    mainWindow.hide();
  }
};

app.whenReady().then(initializeApp);

app.on('window-all-closed', () => {
  if (!isMac) {
    isQuitting = true;
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

if (!isDev) {
  app.setAsDefaultProtocolClient('financetracker');
  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('deep-link', url);
    }
  });
}

module.exports = { mainWindow, tray, isQuitting };
