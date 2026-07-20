const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const { exec } = require("child_process");

let mainWindow;
let isInstalling = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 700,
    height: 560,
    resizable: false,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "installer.html"));

  // Показываем окно только после полной загрузки
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
}

// Получение пути к ресурсам приложения
function getAppSourcePath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app");
  }
  return path.join(__dirname, "..", "dist-electron", "win-unpacked");
}

// Получение размера папки
function getFolderSize(folderPath) {
  let totalSize = 0;
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(folderPath, file.name);
      if (file.isDirectory()) {
        totalSize += getFolderSize(filePath);
      } else {
        totalSize += fs.statSync(filePath).size;
      }
    }
  } catch (e) {
    // игнорируем ошибки
  }
  return totalSize;
}

// Форматирование размера
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

// Копирование файлов с прогрессом
async function copyFiles(src, dest, progressCallback) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  let completed = 0;
  const total = entries.length;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyFiles(srcPath, destPath, (subProgress) => {
        const overallProgress = (completed + subProgress) / total;
        progressCallback(Math.min(overallProgress, 0.99));
      });
    } else {
      await fs.copy(srcPath, destPath, { overwrite: true });
    }

    completed++;
    progressCallback(completed / total);
  }
}

// Создание ярлыка через PowerShell
function createShortcut(target, shortcutPath, description) {
  return new Promise((resolve, reject) => {
    const psScript = `
      $WScriptShell = New-Object -ComObject WScript.Shell
      $Shortcut = $WScriptShell.CreateShortcut("${shortcutPath.replace(/\\/g, "\\\\")}")
      $Shortcut.TargetPath = "${target.replace(/\\/g, "\\\\")}"
      $Shortcut.Description = "${description || ""}"
      $Shortcut.WorkingDirectory = "${path.dirname(target).replace(/\\/g, "\\\\")}"
      $Shortcut.Save()
    `;

    exec(`powershell -Command "${psScript.replace(/"/g, '\\"')}"`, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

// IPC: Получить информацию об установке
ipcMain.handle("get-install-info", async () => {
  const sourcePath = getAppSourcePath();
  const defaultPath = path.join("C:\\", "FinanceTracker");

  let size = 0;
  try {
    size = getFolderSize(sourcePath);
  } catch (e) {
    size = 0;
  }

  return {
    appName: "FinanceTracker",
    version: "1.0.34",
    sourceSize: formatSize(size),
    sourceSizeBytes: size,
    defaultPath: defaultPath,
    sourcePath: sourcePath,
  };
});

// IPC: Выбрать папку установки
ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
    title: "Выберите папку для установки FinanceTracker",
    defaultPath: "C:\\",
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// IPC: Начать установку
ipcMain.handle("start-install", async (event, installPath) => {
  if (isInstalling)
    return { success: false, error: "Установка уже выполняется" };
  isInstalling = true;

  try {
    const sourcePath = getAppSourcePath();
    const win = BrowserWindow.fromWebContents(event.sender);

    // Создаём целевую папку
    await fs.ensureDir(installPath);

    // Копируем файлы
    await copyFiles(sourcePath, installPath, (progress) => {
      win.webContents.send("install-progress", {
        stage: "copying",
        progress: progress,
        message: `Копирование файлов... ${Math.round(progress * 100)}%`,
      });
    });

    // Создаём ярлыки
    win.webContents.send("install-progress", {
      stage: "shortcuts",
      progress: 1,
      message: "Создание ярлыков...",
    });

    const exePath = path.join(installPath, "FinanceTracker.exe");
    const desktopPath = path.join(app.getPath("desktop"), "FinanceTracker.lnk");
    const startMenuPath = path.join(
      app.getPath("appData"),
      "Microsoft",
      "Windows",
      "Start Menu",
      "Programs",
      "FinanceTracker.lnk",
    );

    try {
      await createShortcut(
        exePath,
        desktopPath,
        "FinanceTracker — управление личными финансами",
      );
    } catch (e) {
      console.log("Не удалось создать ярлык на рабочем столе:", e.message);
    }

    try {
      await createShortcut(
        exePath,
        startMenuPath,
        "FinanceTracker — управление личными финансами",
      );
    } catch (e) {
      console.log("Не удалось создать ярлык в меню Пуск:", e.message);
    }

    win.webContents.send("install-progress", {
      stage: "complete",
      progress: 1,
      message: "Установка завершена!",
    });

    return { success: true, installPath };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    isInstalling = false;
  }
});

// IPC: Запустить приложение
ipcMain.handle("launch-app", async (event, installPath) => {
  const exePath = path.join(installPath, "FinanceTracker.exe");
  try {
    exec(`"${exePath}"`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC: Закрыть установщик
ipcMain.handle("close-installer", () => {
  app.quit();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
