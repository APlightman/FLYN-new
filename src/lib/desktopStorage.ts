import type { AppState } from '../types';

const RENDERER_STATE_STORAGE_KEY = 'financeAppState';
const LEGACY_SETTINGS_STORAGE_KEY = 'financeAppSettings';

type StorageLoadResult = {
  state: Partial<AppState> | null;
  source: 'sqlite' | 'localStorage' | 'default';
  error?: string | null;
  status?: unknown;
};

const readRendererFallbackState = (): Partial<AppState> => {
  if (typeof window === 'undefined') {
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
    console.error('Local renderer storage read error:', error);
    return {};
  }
};

const writeRendererFallbackState = (state: AppState) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(RENDERER_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Local renderer storage write error:', error);
  }
};

export const loadDesktopAppState = async (): Promise<StorageLoadResult> => {
  const fallbackState = readRendererFallbackState();

  if (typeof window === 'undefined' || !window.electronAPI?.loadAppState) {
    return {
      state: fallbackState,
      source: Object.keys(fallbackState).length > 0 ? 'localStorage' : 'default',
    };
  }

  try {
    const result = await window.electronAPI.loadAppState();

    if (result?.success && result.state) {
      return {
        state: result.state,
        source: 'sqlite',
        status: result.status,
      };
    }

    return {
      state: fallbackState,
      source: Object.keys(fallbackState).length > 0 ? 'localStorage' : 'default',
      error: result?.error ?? null,
      status: result?.status,
    };
  } catch (error) {
    return {
      state: fallbackState,
      source: Object.keys(fallbackState).length > 0 ? 'localStorage' : 'default',
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const saveDesktopAppState = async (state: AppState) => {
  writeRendererFallbackState(state);

  if (typeof window === 'undefined' || !window.electronAPI?.saveAppState) {
    return {
      success: false,
      storage: 'localStorage',
      error: null,
    };
  }

  try {
    const result = await window.electronAPI.saveAppState(state);
    return {
      success: !!result?.success,
      storage: result?.status?.storage ?? 'sqlite',
      error: result?.error ?? null,
      status: result?.status,
    };
  } catch (error) {
    return {
      success: false,
      storage: 'localStorage',
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const bootstrapDesktopDomainData = async (state: AppState) => {
  if (typeof window === 'undefined' || !window.electronAPI?.bootstrapDomainData) {
    return null;
  }

  try {
    return await window.electronAPI.bootstrapDomainData(state);
  } catch (error) {
    console.warn('Domain bootstrap failed:', error);
    return null;
  }
};

export const loadDesktopDomainData = async () => {
  if (typeof window === 'undefined' || !window.electronAPI?.listDomainData) {
    return null;
  }

  try {
    return await window.electronAPI.listDomainData();
  } catch (error) {
    console.warn('Domain load failed:', error);
    return null;
  }
};

export const createDesktopEntity = async (entityType: string, payload: unknown) => {
  if (typeof window === 'undefined' || !window.electronAPI?.createEntity) {
    return null;
  }

  try {
    return await window.electronAPI.createEntity(entityType, payload);
  } catch (error) {
    console.warn(`Create entity failed for ${entityType}:`, error);
    return null;
  }
};

export const updateDesktopEntity = async (entityType: string, id: string, updates: unknown) => {
  if (typeof window === 'undefined' || !window.electronAPI?.updateEntity) {
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
  if (typeof window === 'undefined' || !window.electronAPI?.deleteEntity) {
    return null;
  }

  try {
    return await window.electronAPI.deleteEntity(entityType, id);
  } catch (error) {
    console.warn(`Delete entity failed for ${entityType}:`, error);
    return null;
  }
};

export const getRendererStateStorageKey = () => RENDERER_STATE_STORAGE_KEY;
