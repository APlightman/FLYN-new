import path from "path";

// ===== Инициализация Electron API =====
// В Electron 28+ с ESM import('electron') работает корректно.
// Устанавливаем глобальные переменные для electronRuntime.js
const initElectron = async () => {
  try {
    const electronMod = await import('electron');
    const electron = electronMod.default || electronMod;
    if (typeof electron === 'object' && electron !== null && !Array.isArray(electron) && Object.keys(electron).length > 0) {
      globalThis.__electron_app = electron.app;
      globalThis.__electron_BrowserWindow = electron.BrowserWindow;
      globalThis.__electron_dialog = electron.dialog;
      globalThis.__electron_globalShortcut = electron.globalShortcut;
      globalThis.__electron_ipcMain = electron.ipcMain;
      globalThis.__electron_Menu = electron.Menu;
      globalThis.__electron_Notification = electron.Notification;
      globalThis.__electron_session = electron.session;
      globalThis.__electron_shell = electron.shell;
      globalThis.__electron_Tray = electron.Tray;
      return electron;
    }
  } catch (err) {
    console.warn('[main] Failed to load electron via import(), trying require fallback...');
  }
  
  // Fallback: createRequire
  try {
    const { createRequire } = await import('module');
    const req = createRequire(import.meta.url);
    const electron = req('electron');
    if (typeof electron === 'object' && electron !== null && !Array.isArray(electron) && Object.keys(electron).length > 0) {
      globalThis.__electron_app = electron.app;
      globalThis.__electron_BrowserWindow = electron.BrowserWindow;
      globalThis.__electron_dialog = electron.dialog;
      globalThis.__electron_globalShortcut = electron.globalShortcut;
      globalThis.__electron_ipcMain = electron.ipcMain;
      globalThis.__electron_Menu = electron.Menu;
      globalThis.__electron_Notification = electron.Notification;
      globalThis.__electron_session = electron.session;
      globalThis.__electron_shell = electron.shell;
      globalThis.__electron_Tray = electron.Tray;
      return electron;
    }
  } catch (err) {
    console.error('[main] Failed to load electron:', err.message);
  }
  
  return null;
};

// ===== Обработка флага --init-db =====
// Запуск: FinanceTracker.exe --init-db
// Создаёт БД и применяет миграции, затем завершает процесс.
// Используется на этапе установки (NSIS) и при первом запуске.
const handleInitDbFlag = async (app) => {
  console.log("[main] --init-db flag detected. Initializing database...");
  try {
    const { initializeDatabase } = await import('./scripts/init-db.js');
    const result = await initializeDatabase(app);
    if (result.success) {
      console.log("[main] Database initialized successfully via --init-db");
      console.log(`[main] Database path: ${result.path}`);
    } else {
      console.error(`[main] Database initialization failed: ${result.error}`);
    }
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[main] Database initialization failed: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
};

// Динамический импорт всех модулей после инициализации Electron
const main = async () => {
  const electron = await initElectron();
  if (!electron) {
    console.error('[main] Electron API not available, exiting');
    process.exit(1);
  }
  
  const { app, BrowserWindow, session, ipcMain, Notification, dialog } = electron;
  
  // ===== Обработка --init-db =====
  // Должна быть выполнена ДО app.whenReady(), чтобы не создавать окно
  if (process.argv.includes('--init-db')) {
    const result = await handleInitDbFlag(app);
    // Даже если не удалось — завершаем процесс, чтобы установщик не завис
    app.quit();
    return;
  }
  
  // Теперь импортируем модули, которые используют electronRuntime.js
  // Они получат API через globalThis
  const { createMainWindow, getIconPath } = await import('./modules/windowManager.js');
  const { createTray } = await import('./modules/trayManager.js');
  const { createApplicationMenu } = await import('./modules/menuManager.js');
  const { setupIPC } = await import('./modules/ipcHandlers.js');
  const { setupAutoUpdater } = await import('./modules/autoUpdater.js');
  const { registerGlobalShortcuts } = await import('./modules/shortcuts.js');
  const {
    closeDatabaseConnectionSync,
    ensureDatabaseReady,
    flushDatabaseToDiskSync,
    getStorageStatus,
    loadPersistedAppState,
    savePersistedAppState,
  } = await import('./modules/db/index.js');

  const isDev = process.env.NODE_ENV === "development";
  const isMac = process.platform === "darwin";

  let mainWindow;
  let tray;
  let isQuitting = false;

  // Настройка поведения при закрытии окна
  let closeBehavior = "minimize-to-tray";

  // ===== Single Instance Lock =====
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    console.log("[main] Second instance detected, quitting...");
    app.quit();
    return;
  }

  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    console.log("[main] Second instance attempt detected, focusing existing window...");
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (mainWindow.isVisible()) mainWindow.focus();
      else { mainWindow.show(); mainWindow.focus(); }
    }
  });

  const updateTrayBadge = (count) => {
    if (tray) {
      tray.setToolTip(count > 0 ? `FinanceTracker - ${count} предупреждений` : "FinanceTracker - Управление финансами");
    }
  };

  const loadCloseBehavior = async () => {
    try {
      const result = await loadPersistedAppState();
      if (result?.success && result?.state?.closeBehavior) {
        closeBehavior = result.state.closeBehavior;
        console.log(`[main] Close behavior loaded: ${closeBehavior}`);
      }
    } catch (e) {
      console.warn("[main] Could not load close behavior, using default:", e.message);
    }
  };

  const handleWindowClose = (event) => {
    if (isQuitting) return;
    if (closeBehavior === "minimize-to-tray") {
      event.preventDefault();
      mainWindow.hide();
      if (Notification.isSupported()) {
        new Notification({
          title: "FinanceTracker",
          body: "Приложение свёрнуто в системный трей",
          icon: getIconPath(),
        }).show();
      }
    }
  };

  const initializeApp = () => {
    mainWindow = createMainWindow(isDev);
    mainWindow.on("close", handleWindowClose);
    tray = createTray(mainWindow);
    createApplicationMenu(mainWindow);
    setupIPC(mainWindow, updateTrayBadge);
    setupAutoUpdater(mainWindow);
    registerGlobalShortcuts(mainWindow);
    if (isMac && process.argv.includes("--hidden")) {
      app.dock.hide();
      mainWindow.hide();
    }
  };

  app.whenReady().then(async () => {
    // ===== Инициализация БД (обязательный этап) =====
    let dbReady = false;
    try {
      console.log("[main] Initializing database...");
      const db = await ensureDatabaseReady();
      if (db) {
        flushDatabaseToDiskSync();
        console.log("[main] Database initialized successfully");
        dbReady = true;
      } else {
        console.warn("[main] Database initialization returned null");
      }
    } catch (dbError) {
      console.error("[main] Database initialization failed:", dbError);
    }

    // Если БД не создалась — пытаемся создать через init-db скрипт
    if (!dbReady) {
      console.log("[main] Attempting to initialize database via init-db script...");
      const initResult = await handleInitDbFlag(app);
      if (initResult.success) {
        // Повторно открываем БД
        try {
          const db = await ensureDatabaseReady();
          if (db) {
            flushDatabaseToDiskSync();
            console.log("[main] Database initialized successfully after retry");
            dbReady = true;
          }
        } catch (retryError) {
          console.error("[main] Database retry failed:", retryError);
        }
      }
    }

    // Если БД так и не создалась — показываем ошибку и завершаем работу
    if (!dbReady) {
      console.error("[main] CRITICAL: Database could not be initialized. Exiting.");
      try {
        await dialog.showErrorBox(
          "Ошибка базы данных",
          "Не удалось создать базу данных приложения.\n\n" +
          "Пожалуйста, убедитесь, что:\n" +
          "1. У вас есть права на запись в папку приложения\n" +
          "2. На диске достаточно свободного места\n" +
          "3. Антивирус не блокирует создание файлов\n\n" +
          "Если ошибка повторяется, переустановите приложение."
        );
      } catch (_) {
        // dialog может быть недоступен
      }
      app.quit();
      return;
    }

    const storageStatus = getStorageStatus();
    if (storageStatus.available) {
      console.log(`SQLite storage ready: ${storageStatus.path}`);
    } else {
      console.warn(`SQLite storage unavailable: ${storageStatus.error || "driver not installed"}`);
    }

    await loadCloseBehavior();

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' data: https://www.googletagmanager.com; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "img-src 'self' data:; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "connect-src 'self' https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://www.googleapis.com;",
          ],
        },
      });
    });

    ipcMain.handle("get-close-behavior", () => closeBehavior);
    ipcMain.handle("set-close-behavior", async (event, behavior) => {
      if (behavior !== "exit" && behavior !== "minimize-to-tray") {
        return { success: false, error: "Invalid close behavior" };
      }
      closeBehavior = behavior;
      console.log(`[main] Close behavior set to: ${behavior}`);
      try {
        const currentState = await loadPersistedAppState();
        const state = currentState?.success && currentState?.state
          ? { ...currentState.state, closeBehavior: behavior }
          : { closeBehavior: behavior };
        await savePersistedAppState(state);
      } catch (e) {
        console.warn("[main] Could not persist close behavior:", e.message);
      }
      return { success: true };
    });

    initializeApp();
  });

  app.on("window-all-closed", () => {
    if (!isMac) { isQuitting = true; app.quit(); }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) initializeApp();
    else if (mainWindow) mainWindow.show();
  });

  app.on("before-quit", () => {
    isQuitting = true;
    console.log("[main] before-quit: saving database synchronously...");
    closeDatabaseConnectionSync();
    console.log("[main] before-quit: database closed");
  });

  app.on("ready", () => {
    if (mainWindow) {
      mainWindow.webContents.on("ipc-message", (event, channel, count) => {
        if (channel === "update-tray-badge") updateTrayBadge(count);
      });
    }
  });

  if (!isDev) {
    app.setAsDefaultProtocolClient("financetracker");
    app.on("open-url", (event, url) => {
      event.preventDefault();
      if (mainWindow) {
        mainWindow.show();
        mainWindow.webContents.send("deep-link", url);
      }
    });
  }
};

main().catch(err => {
  console.error('[main] Fatal error:', err);
  process.exit(1);
});
