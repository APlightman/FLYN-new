import path from "path";
import { app, BrowserWindow, session } from "./modules/electronRuntime.js";
import { createMainWindow } from "./modules/windowManager.js";
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
} from "./modules/db/index.js";

const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";

let mainWindow;
let tray;
let isQuitting = false;

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

const initializeApp = () => {
  mainWindow = createMainWindow(isDev);
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
