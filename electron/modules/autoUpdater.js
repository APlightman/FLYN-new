import pkg from 'electron-updater';

const resolveAutoUpdater = () => {
  try {
    return pkg.autoUpdater;
  } catch (error) {
    console.warn('Автообновление недоступно в текущем runtime:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

const setupAutoUpdater = (mainWindow) => {
  if (process.env.NODE_ENV === 'development' || !process.versions.electron) return;

  const autoUpdater = resolveAutoUpdater();
  if (!autoUpdater) {
    return;
  }

  autoUpdater.on('checking-for-update', () => {
    console.log('Проверка обновлений...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Доступно обновление:', info);
    if (mainWindow) {
      mainWindow.webContents.send('update-available', info);
    }
  });

  autoUpdater.on('update-not-available', () => {
    console.log('Обновлений не найдено');
  });

  autoUpdater.on('error', (err) => {
    console.error('Ошибка автообновления:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) {
      mainWindow.webContents.send('download-progress', progressObj);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Обновление загружено');
    if (mainWindow) {
      mainWindow.webContents.send('update-downloaded', info);
    }
  });

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 60 * 60 * 1000);

  autoUpdater.checkForUpdatesAndNotify();
};

export { setupAutoUpdater };
