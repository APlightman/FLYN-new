import React from 'react';
import { Select } from '../ui/Select';

interface ExportSettingsProps {
  exportSettings: {
    defaultFormat: string;
    includeCategories: boolean;
    includeGoals: boolean;
  };
  onUpdateExportSettings: (updates: any) => void;
}

export function ExportSettings({ exportSettings, onUpdateExportSettings }: ExportSettingsProps) {
  const exportFormatOptions = [
    { value: 'csv', label: 'CSV файл' },
    { value: 'excel', label: 'Excel файл' },
    { value: 'pdf', label: 'PDF отчёт' },
    { value: 'json', label: 'JSON данные' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Select
        label="Формат экспорта по умолчанию"
        value={exportSettings.defaultFormat}
        onChange={(e) => onUpdateExportSettings({ defaultFormat: e.target.value })}
        options={exportFormatOptions}
        fullWidth
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Включать в экспорт
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={exportSettings.includeCategories}
              onChange={(e) => onUpdateExportSettings({ includeCategories: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Категории</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={exportSettings.includeGoals}
              onChange={(e) => onUpdateExportSettings({ includeGoals: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Финансовые цели</span>
          </label>
        </div>
      </div>
    </div>
  );
}