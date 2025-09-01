const { BrowserWindow, shell, Notification } = require('electron');
const path = require('path');

const isMac = process.platform === 'darwin';

const getIconPath = () => {
  const iconName = process.platform === 'win32' ? 'icon.ico' : 
                   isMac ? 'icon.icns' : 'icon.png';
  return path.join(__dirname, '../assets', iconName);
};

const createMainWindow = (isDev) => {
  const windowOptions = {
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, '../preload.js')
    },
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    frame: !isMac,
    icon: getIconPath(),
    backgroundColor: '#f8fafc',
    vibrancy: isMac ? 'under-window' : undefined,
    trafficLightPosition: isMac ? { x: 20, y: 20 } : undefined
  };

  const mainWindow = new BrowserWindow(windowOptions);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('close', (event) => {
    const { isQuitting } = require('../main');
    if (!isQuitting) {
      event.preventDefault();
      if (isMac) {
        require('electron').app.hide();
      } else {
        mainWindow.hide();
      }
      
      if (Notification.isSupported()) {
        new Notification({
          title: 'FinanceTracker',
          body: 'Приложение свернуто в системный трей',
          icon: getIconPath()
        }).show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
};

module.exports = { createMainWindow, getIconPath };
