const { globalShortcut } = require('electron');
const { showMainWindow } = require('./trayManager');

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

module.exports = { registerGlobalShortcuts, unregisterShortcuts };
