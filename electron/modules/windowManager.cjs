const path = require("path");
const { BrowserWindow, shell, Notification, app } = require("./electronRuntime.cjs");

const isMac = process.platform === "darwin";

const getIconPath = () => {
  const iconName =
    process.platform === "win32"
      ? "icon.ico"
      : isMac
        ? "icon.icns"
        : "icon.png";
  return path.join(__dirname, "../assets", iconName);
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
      preload: path.join(__dirname, "../preload.js"),
    },
    titleBarStyle: isMac ? "hiddenInset" : "default",
    frame: !isMac,
    icon: getIconPath(),
    backgroundColor: "#f8fafc",
    vibrancy: isMac ? "under-window" : undefined,
    trafficLightPosition: isMac ? { x: 20, y: 20 } : undefined,
  };

  const mainWindow = new BrowserWindow(windowOptions);

  if (isDev) {
    mainWindow.loadURL("http://localhost:5179");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  const showFallback = setTimeout(() => {
    if (!mainWindow.isVisible() && !mainWindow.isDestroyed()) {
      console.warn("Fallback: showing window after timeout");
      mainWindow.show();
      mainWindow.focus();
    }
  }, 3000);

  mainWindow.once("show", () => {
    clearTimeout(showFallback);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return mainWindow;
};

module.exports = { createMainWindow, getIconPath };