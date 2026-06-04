import fs from "fs";
import pkg from "electron-updater";
import { ipcMain, dialog, Notification, app } from "./electronRuntime.js";
import { getIconPath } from "./windowManager.js";
import {
  bootstrapDomainDataFromState,
  checkExternalDatabase,
  createDomainEntity,
  deleteDomainEntity,
  getStorageStatus,
  importFromExternalDatabase,
  listDomainData,
  loadPersistedAppState,
  savePersistedAppState,
  updateDomainEntity,
} from "./db/index.js";
import {
  validateEntityPayload,
  isValidEntityType,
  validateId,
  validateUpdates,
} from "./validation.js";

const getAutoUpdater = () => {
  if (!app.isPackaged) {
    return null;
  }

  try {
    return pkg.autoUpdater;
  } catch (error) {
    console.warn(
      "AutoUpdater unavailable in current runtime:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
};

const setupIPC = (mainWindow, updateTrayBadge) => {
  ipcMain.on("restart-app", () => {
    const autoUpdater = getAutoUpdater();
    if (autoUpdater) {
      autoUpdater.quitAndInstall();
    }
  });
  ipcMain.handle("show-save-dialog", async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Сохранить экспорт",
      defaultPath: options.defaultPath || "export.csv",
      filters: options.filters || [
        { name: "CSV файлы", extensions: ["csv"] },
        { name: "Excel файлы", extensions: ["xlsx", "xls"] },
        { name: "Все файлы", extensions: ["*"] },
      ],
    });
    return result;
  });

  ipcMain.handle("show-open-dialog", async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: options.title || "Выберите файл для импорта",
      filters: options.filters || [
        { name: "CSV файлы", extensions: ["csv"] },
        { name: "Excel файлы", extensions: ["xlsx", "xls"] },
        { name: "Все файлы", extensions: ["*"] },
      ],
      properties: options.properties || ["openFile"],
    });
    return result;
  });

  ipcMain.handle("save-file", async (event, filePath, content) => {
    try {
      fs.writeFileSync(filePath, content, "utf8");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("read-file", async (event, filePath) => {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("show-notification", (event, options) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: options.title || "FinanceTracker",
        body: options.body,
        icon: getIconPath(),
        silent: options.silent || false,
      });

      notification.show();

      if (options.onClick) {
        notification.on("click", () => {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        });
      }

      return true;
    }
    return false;
  });

  ipcMain.handle("update-tray-badge", (event, count) => {
    if (updateTrayBadge) {
      updateTrayBadge(count);
    }
  });

  ipcMain.handle("get-system-info", () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
    };
  });

  ipcMain.handle("storage:get-status", async () => {
    return getStorageStatus();
  });

  ipcMain.handle("storage:load-app-state", async () => {
    return loadPersistedAppState();
  });

  ipcMain.handle("storage:save-app-state", async (event, state) => {
    return savePersistedAppState(state);
  });

  ipcMain.handle("storage:bootstrap-domain-data", async (event, state) => {
    return bootstrapDomainDataFromState(state);
  });

  ipcMain.handle("storage:list-domain-data", async () => {
    return listDomainData();
  });

  ipcMain.handle(
    "storage:create-entity",
    async (event, entityType, payload) => {
      // Валидация типа сущности
      if (!isValidEntityType(entityType)) {
        return {
          success: false,
          error: `Неизвестный тип сущности: ${entityType}`,
          status: { ready: false, error: "Validation failed" },
        };
      }

      // Валидация payload
      const validation = validateEntityPayload(entityType, payload);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Ошибка валидации: ${validation.errors.join(", ")}`,
          status: { ready: false, error: "Validation failed" },
        };
      }

      // Передаем очищенные данные
      return createDomainEntity(entityType, validation.sanitized);
    },
  );

  ipcMain.handle(
    "storage:update-entity",
    async (event, entityType, id, updates) => {
      // Валидация типа сущности
      if (!isValidEntityType(entityType)) {
        return {
          success: false,
          error: `Неизвестный тип сущности: ${entityType}`,
          status: { ready: false, error: "Validation failed" },
        };
      }

      // Валидация ID
      if (!validateId(id)) {
        return {
          success: false,
          error: "Неверный идентификатор",
          status: { ready: false, error: "Validation failed" },
        };
      }

      // Валидация updates
      const validation = validateUpdates(entityType, updates);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Ошибка валидации обновлений: ${validation.errors.join(", ")}`,
          status: { ready: false, error: "Validation failed" },
        };
      }

      // Передаем очищенные обновления
      return updateDomainEntity(entityType, id, validation.sanitized);
    },
  );

  ipcMain.handle("storage:delete-entity", async (event, entityType, id) => {
    // Валидация типа сущности
    if (!isValidEntityType(entityType)) {
      return {
        success: false,
        error: `Неизвестный тип сущности: ${entityType}`,
        status: { ready: false, error: "Validation failed" },
      };
    }

    // Валидация ID
    if (!validateId(id)) {
      return {
        success: false,
        error: "Неверный идентификатор",
        status: { ready: false, error: "Validation failed" },
      };
    }

    return deleteDomainEntity(entityType, id);
  });

  // ===== Импорт данных из внешней SQLite БД =====

  /**
   * Проверить наличие SQLite-файлов в указанной директории
   * По умолчанию проверяет C:\SQLite\
   */
  ipcMain.handle("storage:check-external-db", async (event, directoryPath) => {
    const targetPath = directoryPath || "C:\\SQLite";
    return checkExternalDatabase(targetPath);
  });

  /**
   * Импортировать данные из внешнего SQLite-файла
   * @param {string} sourcePath - путь к .db/.sqlite файлу
   */
  ipcMain.handle("storage:import-from-external", async (event, sourcePath) => {
    if (!sourcePath) {
      return {
        success: false,
        error: "Не указан путь к файлу для импорта",
      };
    }

    return importFromExternalDatabase(sourcePath);
  });
};

export { setupIPC };
