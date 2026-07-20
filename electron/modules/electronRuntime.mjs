// Electron 28+ ESM support
// Прямой import из 'electron' работает в Electron 28+ благодаря встроенному загрузчику
// Вне Electron процесса (тесты) используется createRequire как fallback
let electron;

try {
  // Пытаемся импортировать electron напрямую (работает в Electron 28+)
  // Используем динамический import, т.к. статический может не сработать вне Electron
  const mod = await import('electron');
  const e = mod.default || mod;
  if (typeof e === 'object' && e !== null && !Array.isArray(e) && Object.keys(e).length > 0) {
    electron = e;
  } else {
    electron = {};
  }
} catch (_) {
  // Fallback: createRequire для тестовой среды
  try {
    const { createRequire } = await import('module');
    const req = createRequire(import.meta.url);
    const result = req('electron');
    if (typeof result === 'object' && result !== null && !Array.isArray(result) && Object.keys(result).length > 0) {
      electron = result;
    } else {
      electron = {};
    }
  } catch (__) {
    electron = {};
  }
}

const {
  app = {},
  BrowserWindow = {},
  dialog = {},
  globalShortcut = {},
  ipcMain = {},
  Menu = {},
  Notification = function() {},
  session = {},
  shell = {},
  Tray = function() {},
} = electron;

export {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  Notification,
  session,
  shell,
  Tray,
};

export default electron;