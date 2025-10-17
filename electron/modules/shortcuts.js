import { globalShortcut } from 'electron';
import { showMainWindow } from './trayManager.js';

const registerGlobalShortcuts = (mainWindow) => {
  globalShortcut.register('CmdOrCtrl+Shift+F', () => {
    showMainWindow(mainWindow);
    mainWindow.webContents.send('quick-action', 'add-transaction');
  });

  globalShortcut.register('CmdOrCtrl+Shift+Space', () => {
    if (mainWindow && mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      showMainWindow(mainWindow);
    }
  });
};

const unregisterShortcuts = () => {
  globalShortcut.unregisterAll();
};

export { registerGlobalShortcuts, unregisterShortcuts };
