import path from "path";
import {
  app,
  BrowserWindow,
  session,
  ipcMain,
  Notification,
} from "./modules/electronRuntime.js";
import { createMainWindow, getIconPath } from "./modules/windowManager.js";
import { createTray } from "./modules/trayManager.js";
import { createApplicationMenu } from "./modules/menuManager.js";
import { setupIPC } from "./modules/ipcHandlers.js";
import { setupAutoUpdater } from "./modules/autoUpdater.js";
import { registerGlobalShortcuts } from "./modules/shortcuts.js";
import {
  closeDatabaseConnectionSync,
  ensureDatabaseReady,
  flushDatabaseToDiskSync,
  getStorageStatus,
  loadPersistedAppState,
  savePersistedAppState,
} from "./modules/db/index.js";

const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";

let mainWindow;
let tray;
let isQuitting = false;

// Настройка поведения при закрытии окна
// 'exit' — полный выход из приложения
// 'minimize-to-tray' — сворачивание в системный трей
let closeBehavior = "minimize-to-tray"; // значение по умолчанию

// ===== Single Instance Lock =====
// Предотвращает запуск второго экземпляра приложения.
// Если второй экземпляр пытается запуститься — показываем существующее окно.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log("[main] Second instance detected, quitting...");
  app.quit();
} else {
  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    console.log(
      "[main] Second instance attempt detected, focusing existing window...",
    );
    // Кто-то пытается запустить второй экземпляр — показываем наше окно
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// Update tray badge function
const updateTrayBadge = (count) => {
  if (tray) {
    if (count > 0) {
      tray.setToolTip(`FinanceTracker - ${count} предупреждений`);
    } else {
      tray.setToolTip("FinanceTracker - Управление финансами");
    }
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
    console.warn(
      "[main] Could not load close behavior, using default:",
      e.message,
    );
  }
};

const handleWindowClose = (event) => {
  if (isQuitting) return; // если уже выходим — не вмешиваемся

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
  // Если closeBehavior === 'exit' — окно закрывается стандартно,
  // и срабатывает 'window-all-closed' -> app.quit()
};

const initializeApp = () => {
  mainWindow = createMainWindow(isDev);

  // Навешиваем обработчик закрытия окна
  mainWindow.on("close", handleWindowClose);

  tray = createTray(mainWindow);
  createApplicationMenu(mainWindow);

  // Setup IPC with the updateTrayBadge function
  setupIPC(mainWindow, updateTrayBadge);

  setupAutoUpdater(mainWindow);
  registerGlobalShortcuts(mainWindow);

  if (isMac && process.argv.includes("--hidden")) {
    app.dock.hide();
    mainWindow.hide();
  }
};

app.whenReady().then(async () => {
  // ===== Инициализация БД при первом запуске =====
  // better-sqlite3 создаёт файл БД и применяет миграции автоматически.
  // Данные пишутся на диск синхронно при каждой операции.
  try {
    console.log("[main] Initializing database...");
    const db = await ensureDatabaseReady();
    if (db) {
      // Делаем WAL checkpoint для гарантии целостности
      flushDatabaseToDiskSync();
      console.log("[main] Database initialized successfully");
    } else {
      console.warn("[main] Database initialization returned null");
    }
  } catch (dbError) {
    console.error("[main] Database initialization failed:", dbError);
  }

  const storageStatus = getStorageStatus();
  if (storageStatus.available) {
    console.log(`SQLite storage ready: ${storageStatus.path}`);
  } else {
    console.warn(
      `SQLite storage unavailable: ${storageStatus.error || "driver not installed"}`,
    );
  }

  // Загружаем настройку поведения при закрытии из БД
  await loadCloseBehavior();

  // Set Content Security Policy
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

  // IPC-каналы для управления поведением при закрытии
  ipcMain.handle("get-close-behavior", () => {
    return closeBehavior;
  });

  ipcMain.handle("set-close-behavior", async (event, behavior) => {
    if (behavior !== "exit" && behavior !== "minimize-to-tray") {
      return { success: false, error: "Invalid close behavior" };
    }
    closeBehavior = behavior;
    console.log(`[main] Close behavior set to: ${behavior}`);

    // Сохраняем в persisted app state для сохранения между перезапусками
    try {
      const currentState = await loadPersistedAppState();
      const state =
        currentState?.success && currentState?.state
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
  if (!isMac) {
    isQuitting = true;
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeApp();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

/**
 * before-quit — синхронное сохранение БД перед выходом.
 * Используем closeDatabaseConnectionSync, т.к. before-quit не поддерживает async/await.
 */
app.on("before-quit", () => {
  isQuitting = true;
  console.log("[main] before-quit: saving database synchronously...");
  closeDatabaseConnectionSync();
  console.log("[main] before-quit: database closed");
});

// Handle the update-tray-badge IPC call
app.on("ready", () => {
  if (mainWindow) {
    mainWindow.webContents.on("ipc-message", (event, channel, count) => {
      if (channel === "update-tray-badge") {
        updateTrayBadge(count);
      }
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

export { mainWindow, tray, isQuitting };
