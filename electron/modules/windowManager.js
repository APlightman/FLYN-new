import { BrowserWindow, shell, Notification, app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// В ES модулях __dirname не определен, создаем его вручную
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    // We'll handle the isQuitting flag through the main process
    // For now, we'll just hide the window
    event.preventDefault();
    mainWindow.hide();
    
    if (Notification.isSupported()) {
      new Notification({
        title: 'FinanceTracker',
        body: 'Приложение свернуто в системный трей',
        icon: getIconPath()
      }).show();
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

export { createMainWindow, getIconPath };
