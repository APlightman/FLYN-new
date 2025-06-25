import React from 'react';

interface PrivacySettingsProps {
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
  };
  onUpdatePrivacy: (updates: any) => void;
}

export function PrivacySettings({ privacy, onUpdatePrivacy }: PrivacySettingsProps) {
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            Сбор анонимных данных
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Помогает улучшить приложение
          </div>
        </div>
        <input
          type="checkbox"
          checked={privacy.dataCollection}
          onChange={(e) => onUpdatePrivacy({ dataCollection: e.target.checked })}
          className="rounded"
        />
      </label>

      <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
        <div>
          <div className="font-medium text-slate-900 dark:text-slate-100">
            Аналитика использования
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Статистика использования функций
          </div>
        </div>
        <input
          type="checkbox"
          checked={privacy.analytics}
          onChange={(e) => onUpdatePrivacy({ analytics: e.target.checked })}
          className="rounded"
        />
      </label>
    </div>
  );
}