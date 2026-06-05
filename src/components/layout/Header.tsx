import {
  Moon,
  Sun,
  Menu,
  Wallet,
  Monitor,
  Database,
  HardDrive,
  WifiOff,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { Button } from "../ui/Button";
import { NotificationBell } from "./NotificationBell";
import {
  isElectronApp,
  useElectronIntegration,
} from "../../hooks/useElectronIntegration";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { state, toggleDarkMode, isOnline } = useApp();
  const { storageInfo } = useElectronIntegration();
  const isElectron = isElectronApp();
  const isSqlite = storageInfo?.storage === "sqlite";

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden rounded-xl p-2 sm:p-3"
          >
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/25">
              <Wallet className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                FinanceTracker
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Управление финансами
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Десктопный режим + SQLite */}
          {isElectron && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
              <Monitor size={14} className="text-blue-500" />
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Десктоп
              </span>
              <span className="text-slate-300 dark:text-slate-600 mx-0.5">
                •
              </span>
              {isSqlite ? (
                <Database size={14} className="text-emerald-500" />
              ) : (
                <HardDrive size={14} className="text-amber-500" />
              )}
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {isSqlite ? "SQLite" : "Локально"}
              </span>
            </div>
          )}

          {/* Офлайн-статус */}
          {!isOnline && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
              <WifiOff size={11} />
              <span className="hidden sm:inline">Офлайн</span>
            </span>
          )}

          <NotificationBell />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="rounded-xl p-2 sm:p-3"
          >
            {state.darkMode ? (
              <Sun size={18} className="text-amber-500" />
            ) : (
              <Moon size={18} className="text-slate-600" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
