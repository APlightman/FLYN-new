const { contextBridge, ipcRenderer } = require("electron");

// Безопасный API для рендер-процесса
contextBridge.exposeInMainWorld("electronAPI", {
  // Файловые операции
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
  saveFile: (filePath, content) =>
    ipcRenderer.invoke("save-file", filePath, content),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),

  // Уведомления
  showNotification: (options) =>
    ipcRenderer.invoke("show-notification", options),
  updateTrayBadge: (count) => ipcRenderer.invoke("update-tray-badge", count),

  // Системная информация
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),

  // Локальное desktop-хранилище
  getStorageStatus: () => ipcRenderer.invoke("storage:get-status"),
  loadAppState: () => ipcRenderer.invoke("storage:load-app-state"),
  saveAppState: (state) => ipcRenderer.invoke("storage:save-app-state", state),
  bootstrapDomainData: (state) =>
    ipcRenderer.invoke("storage:bootstrap-domain-data", state),
  listDomainData: () => ipcRenderer.invoke("storage:list-domain-data"),
  createEntity: (entityType, payload) =>
    ipcRenderer.invoke("storage:create-entity", entityType, payload),
  updateEntity: (entityType, id, updates) =>
    ipcRenderer.invoke("storage:update-entity", entityType, id, updates),
  deleteEntity: (entityType, id) =>
    ipcRenderer.invoke("storage:delete-entity", entityType, id),

  // Импорт данных из внешней SQLite БД
  checkExternalDatabase: (directoryPath) =>
    ipcRenderer.invoke("storage:check-external-db", directoryPath),
  importFromExternalDatabase: (sourcePath) =>
    ipcRenderer.invoke("storage:import-from-external", sourcePath),

  // Подписка на события от main процесса
  onQuickAction: (callback) => {
    ipcRenderer.on("quick-action", (event, action) => callback(action));
  },

  onNavigateTo: (callback) => {
    ipcRenderer.on("navigate-to", (event, route) => callback(route));
  },

  onShowImport: (callback) => {
    ipcRenderer.on("show-import", () => callback());
  },

  onDeepLink: (callback) => {
    ipcRenderer.on("deep-link", (event, url) => callback(url));
  },

  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update-available", (event, info) => callback(info));
  },

  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update-downloaded", (event, info) => callback(info));
  },

  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress", (event, progress) =>
      callback(progress),
    );
  },

  restartApp: () => {
    ipcRenderer.send("restart-app");
  },

  // Отписка от событий
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Информация о платформе
  platform: process.platform,
  isElectron: true,
  versions: {
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
  },
});

// Добавляем CSS для десктопной оптимизации
document.addEventListener("DOMContentLoaded", () => {
  // Добавляем класс для определения Electron окружения
  document.body.classList.add("electron-app");

  // Оптимизируем скроллинг
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  // Отключаем drag & drop файлов на окно (кроме специальных зон)
  document.addEventListener("dragover", (e) => {
    if (!e.target.closest(".file-drop-zone")) {
      e.preventDefault();
    }
  });

  document.addEventListener("drop", (e) => {
    if (!e.target.closest(".file-drop-zone")) {
      e.preventDefault();
    }
  });
});
