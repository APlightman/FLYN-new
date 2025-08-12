import React from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { Button } from '../ui/Button';

interface SettingsHeaderProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function SettingsHeader({ hasUnsavedChanges, onSave, onReset }: SettingsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-lg shadow-slate-500/25">
          <SettingsIcon className="text-white" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Настройки
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Персонализация и управление приложением
          </p>
        </div>
      </div>

      {/* Индикатор несохранённых изменений */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
          <span className="text-sm text-orange-700 dark:text-orange-300">
            Есть несохранённые изменения
          </span>
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          onClick={onReset}
          disabled={!hasUnsavedChanges}
          fullWidth
          className="sm:flex-1"
        >
          Сбросить
        </Button>
        
        <Button
          onClick={onSave}
          disabled={!hasUnsavedChanges}
          fullWidth
          className={`sm:flex-1 ${hasUnsavedChanges ? 'animate-pulse' : ''}`}
        >
          <Save size={16} className="mr-2" />
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
}
