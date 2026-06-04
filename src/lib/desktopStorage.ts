import type { AppState } from "../types";

const RENDERER_STATE_STORAGE_KEY = "financeAppState";
const LEGACY_SETTINGS_STORAGE_KEY = "financeAppSettings";

type StorageLoadResult = {
  state: Partial<AppState> | null;
  source: "sqlite" | "localStorage" | "default";
  error?: string | null;
  status?: unknown;
};

const readRendererFallbackState = (): Partial<AppState> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const savedState = localStorage.getItem(RENDERER_STATE_STORAGE_KEY);
    const legacySettings = localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);

    return {
      ...(savedState ? JSON.parse(savedState) : {}),
      ...(legacySettings ? JSON.parse(legacySettings) : {}),
    };
  } catch (error) {
    console.error("Local renderer storage read error:", error);
    return {};
  }
};

const writeRendererFallbackState = (state: AppState) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(RENDERER_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Local renderer storage write error:", error);
  }
};

export const loadDesktopAppState = async (): Promise<StorageLoadResult> => {
  const fallbackState = readRendererFallbackState();

  if (typeof window === "undefined" || !window.electronAPI?.loadAppState) {
    return {
      state: fallbackState,
      source:
        Object.keys(fallbackState).length > 0 ? "localStorage" : "default",
    };
  }

  try {
    const result = await window.electronAPI.loadAppState();

    if (result?.success && result.state) {
      return {
        state: result.state,
        source: "sqlite",
        status: result.status,
      };
    }

    return {
      state: fallbackState,
      source:
        Object.keys(fallbackState).length > 0 ? "localStorage" : "default",
      error: result?.error ?? null,
      status: result?.status,
    };
  } catch (error) {
    return {
      state: fallbackState,
      source:
        Object.keys(fallbackState).length > 0 ? "localStorage" : "default",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Извлекает только UI состояние (настройки) из полного состояния приложения.
 * Domain данные заменяются пустыми массивами, чтобы сохранить структуру JSON
 * и обеспечить обратную совместимость.
 */
const extractUIState = (state: AppState): AppState => {
  return {
    filters: state.filters,
    darkMode: state.darkMode,
    selectedDate: state.selectedDate,
    // Domain данные - пустые массивы
    transactions: [],
    categories: [],
    budgets: [],
    goals: [],
    recurringPayments: [],
  };
};

export const saveDesktopAppState = async (state: AppState) => {
  // Сохраняем полное состояние в localStorage fallback (для совместимости)
  writeRendererFallbackState(state);

  if (typeof window === "undefined" || !window.electronAPI?.saveAppState) {
    return {
      success: false,
      storage: "localStorage",
      error: null,
    };
  }

  try {
    // Отправляем только UI состояние, чтобы избежать дублирования domain данных
    const uiState = extractUIState(state);
    const result = await window.electronAPI.saveAppState(uiState);
    return {
      success: !!result?.success,
      storage: result?.status?.storage ?? "sqlite",
      error: result?.error ?? null,
      status: result?.status,
    };
  } catch (error) {
    return {
      success: false,
      storage: "localStorage",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const bootstrapDesktopDomainData = async (state: AppState) => {
  if (
    typeof window === "undefined" ||
    !window.electronAPI?.bootstrapDomainData
  ) {
    return null;
  }

  try {
    return await window.electronAPI.bootstrapDomainData(state);
  } catch (error) {
    console.warn("Domain bootstrap failed:", error);
    return null;
  }
};

export const loadDesktopDomainData = async () => {
  if (typeof window === "undefined" || !window.electronAPI?.listDomainData) {
    return null;
  }

  try {
    return await window.electronAPI.listDomainData();
  } catch (error) {
    console.warn("Domain load failed:", error);
    return null;
  }
};

export const createDesktopEntity = async (
  entityType: string,
  payload: unknown,
) => {
  if (typeof window === "undefined" || !window.electronAPI?.createEntity) {
    return null;
  }

  try {
    return await window.electronAPI.createEntity(entityType, payload);
  } catch (error) {
    console.warn(`Create entity failed for ${entityType}:`, error);
    return null;
  }
};

export const updateDesktopEntity = async (
  entityType: string,
  id: string,
  updates: unknown,
) => {
  if (typeof window === "undefined" || !window.electronAPI?.updateEntity) {
    return null;
  }

  try {
    return await window.electronAPI.updateEntity(entityType, id, updates);
  } catch (error) {
    console.warn(`Update entity failed for ${entityType}:`, error);
    return null;
  }
};

export const deleteDesktopEntity = async (entityType: string, id: string) => {
  if (typeof window === "undefined" || !window.electronAPI?.deleteEntity) {
    return null;
  }

  try {
    return await window.electronAPI.deleteEntity(entityType, id);
  } catch (error) {
    console.warn(`Delete entity failed for ${entityType}:`, error);
    return null;
  }
};

/**
 * Проверить наличие SQLite-файлов во внешней директории (например, C:\SQLite)
 * @param directoryPath - путь к директории для поиска (по умолчанию C:\SQLite)
 */
export const checkExternalDatabase = async (directoryPath?: string) => {
  if (
    typeof window === "undefined" ||
    !window.electronAPI?.checkExternalDatabase
  ) {
    return {
      found: false,
      files: [],
      defaultPath: directoryPath || "C:\\SQLite",
    };
  }

  try {
    return await window.electronAPI.checkExternalDatabase(directoryPath);
  } catch (error) {
    console.warn("External DB check failed:", error);
    return {
      found: false,
      files: [],
      defaultPath: directoryPath || "C:\\SQLite",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Импортировать данные из внешнего SQLite-файла в текущую БД
 * @param sourcePath - путь к .db/.sqlite файлу
 */
export const importFromExternalDatabase = async (sourcePath: string) => {
  if (
    typeof window === "undefined" ||
    !window.electronAPI?.importFromExternalDatabase
  ) {
    return {
      success: false,
      error: "Electron API недоступен",
      imported: {
        transactions: 0,
        categories: 0,
        budgets: 0,
        goals: 0,
        recurringPayments: 0,
        appState: false,
      },
    };
  }

  try {
    return await window.electronAPI.importFromExternalDatabase(sourcePath);
  } catch (error) {
    console.warn("External DB import failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      imported: {
        transactions: 0,
        categories: 0,
        budgets: 0,
        goals: 0,
        recurringPayments: 0,
        appState: false,
      },
    };
  }
};

export const getRendererStateStorageKey = () => RENDERER_STATE_STORAGE_KEY;
