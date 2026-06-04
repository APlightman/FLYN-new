import { WifiOff, Database, Monitor, HardDrive } from "lucide-react";
import {
  isElectronApp,
  useElectronIntegration,
} from "../../hooks/useElectronIntegration";
import { useApp } from "../../contexts/AppContext";

export function SystemStatusBar() {
  const { isOnline } = useApp();
  const { storageInfo } = useElectronIntegration();
  const isElectron = isElectronApp();

  // Если нет ни Electron, ни офлайн-статуса — не показываем ничего
  if (!isElectron && isOnline) return null;

  const isSqlite = storageInfo?.storage === "sqlite";

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-slate-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-900/80 border-b border-slate-200/40 dark:border-slate-700/40">
      {/* Десктопный режим */}
      {isElectron && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <Monitor size={12} className="text-blue-500" />
          <span className="hidden sm:inline">Десктоп</span>
        </span>
      )}

      {/* Хранилище */}
      {isElectron && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="text-slate-300 dark:text-slate-600">•</span>
          {isSqlite ? (
            <Database size={12} className="text-emerald-500" />
          ) : (
            <HardDrive size={12} className="text-amber-500" />
          )}
          <span className="hidden sm:inline">
            {isSqlite ? "SQLite" : "Локально"}
          </span>
        </span>
      )}

      {/* Офлайн-статус */}
      {!isOnline && (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
          <WifiOff size={11} />
          <span>Офлайн</span>
        </span>
      )}
    </div>
  );
}
