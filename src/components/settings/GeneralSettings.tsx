import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface GeneralSettingsProps {
  settings: {
    language: string;
    currency: string;
    dateFormat: string;
  };
  darkMode: boolean;
  onUpdateSettings: (updates: any) => void;
  onToggleDarkMode: () => void;
}

export function GeneralSettings({ 
  settings, 
  darkMode, 
  onUpdateSettings, 
  onToggleDarkMode 
}: GeneralSettingsProps) {
  const languageOptions = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
  ];

  const currencyOptions = [
    { value: 'RUB', label: '₽ Российский рубль' },
    { value: 'USD', label: '$ Доллар США' },
    { value: 'EUR', label: '€ Евро' },
    { value: 'GBP', label: '£ Фунт стерлингов' },
  ];

  const dateFormatOptions = [
    { value: 'DD.MM.YYYY', label: 'ДД.ММ.ГГГГ (31.12.2024)' },
    { value: 'MM/DD/YYYY', label: 'ММ/ДД/ГГГГ (12/31/2024)' },
    { value: 'YYYY-MM-DD', label: 'ГГГГ-ММ-ДД (2024-12-31)' },
    { value: 'DD MMM YYYY', label: 'ДД МММ ГГГГ (31 дек 2024)' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Select
        label="Язык интерфейса"
        value={settings.language}
        onChange={(e) => onUpdateSettings({ language: e.target.value })}
        options={languageOptions}
        fullWidth
      />

      <Select
        label="Валюта по умолчанию"
        value={settings.currency}
        onChange={(e) => onUpdateSettings({ currency: e.target.value })}
        options={currencyOptions}
        fullWidth
      />

      <Select
        label="Формат даты"
        value={settings.dateFormat}
        onChange={(e) => onUpdateSettings({ dateFormat: e.target.value })}
        options={dateFormatOptions}
        fullWidth
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Тема оформления
        </label>
        <div className="flex gap-2">
          <Button
            variant={!darkMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => !darkMode || onToggleDarkMode()}
            className="flex-1"
          >
            <Sun size={16} className="mr-2" />
            Светлая
          </Button>
          <Button
            variant={darkMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => darkMode || onToggleDarkMode()}
            className="flex-1"
          >
            <Moon size={16} className="mr-2" />
            Тёмная
          </Button>
        </div>
      </div>
    </div>
  );
}