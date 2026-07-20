import React from 'react';
import { Select } from '../ui/Select';

interface ExportSettingsProps {
  exportSettings: {
    defaultFormat: string;
    includeCategories: boolean;
    includeGoals: boolean;
  };
  onUpdateExportSettings: (updates: Partial<ExportSettingsProps['exportSettings']>) => void;
}

export function ExportSettings({ exportSettings, onUpdateExportSettings }: ExportSettingsProps) {
  const exportFormatOptions = [
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

      <p className="text-sm text-slate-500 dark:text-slate-400 md:col-span-2">
        Полная резервная копия всегда сохраняется в JSON, чтобы не потерять связанные данные.
      </p>
    </div>
  );
}
