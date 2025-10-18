import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { createMainWindow } from './modules/windowManager.js';
import { createTray } from './modules/trayManager.js';
import { createApplicationMenu } from './modules/menuManager.js';
import { setupIPC } from './modules/ipcHandlers.js';
import { setupAutoUpdater } from './modules/autoUpdater.js';
import { registerGlobalShortcuts } from './modules/shortcuts.js';

const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

let mainWindow;
let tray;
let isQuitting = false;

// Update tray badge function
const updateTrayBadge = (count) => {
  if (tray) {
    if (count > 0) {
      tray.setToolTip(`FinanceTracker - ${count} предупреждений`);
    } else {
      tray.setToolTip('FinanceTracker - Управление финансами');
    }
  }
};

const initializeApp = () => {
  mainWindow = createMainWindow(isDev);
  tray = createTray(mainWindow);
  createApplicationMenu(mainWindow);
  
  // Setup IPC with the updateTrayBadge function
  setupIPC(mainWindow, updateTrayBadge);
  
  setupAutoUpdater(mainWindow);
  registerGlobalShortcuts(mainWindow);
  
  if (isMac && process.argv.includes('--hidden')) {
    app.dock.hide();
    mainWindow.hide();
  }
};

app.whenReady().then(() => {
  // Set Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' data: https://www.googletagmanager.com; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "img-src 'self' data:; " +
          "font-src 'self' https://fonts.gstatic.com; " +
          "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://www.googleapis.com;"
        ]
      }
    });
  });

  initializeApp();
});

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

// Handle the update-tray-badge IPC call
app.on('ready', () => {
  if (mainWindow) {
    mainWindow.webContents.on('ipc-message', (event, channel, count) => {
      if (channel === 'update-tray-badge') {
        updateTrayBadge(count);
      }
    });
  }
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

export { mainWindow, tray, isQuitting };
