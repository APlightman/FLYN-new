import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { SettingsHeader } from './SettingsHeader';
import { SettingsSections } from './SettingsSections';
import { SettingsModals } from './SettingsModals';
import { SettingsState, getDefaultSettings, SETTINGS_STORAGE_KEY } from './settingsTypes';

export function SettingsContainer() {
  const { state, toggleDarkMode } = useApp();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(getDefaultSettings());

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    }
  };

  const updateSettings = (section: keyof SettingsState, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], ...updates }
        : updates
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setHasUnsavedChanges(false);
      
      const event = new CustomEvent('settingsSaved', { detail: settings });
      window.dispatchEvent(event);
      
      alert('Настройки успешно сохранены!');
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      alert('Ошибка при сохранении настроек');
    }
  };

  const resetSettings = () => {
    setSettings(getDefaultSettings());
    setHasUnsavedChanges(true);
  };

  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const getDataStats = () => {
    const data = {
      transactions: state.transactions.length,
      categories: state.categories.length,
      goals: state.goals.length,
      budgets: state.budgets.length,
      recurringPayments: state.recurringPayments.length,
    };
    
    const totalItems = Object.values(data).reduce((sum, count) => sum + count, 0);
    const storageSize = JSON.stringify(state).length;
    
    return { ...data, totalItems, storageSize };
  };

  const handleExportData = () => {
    console.log('Экспорт данных в формате:', settings.export.defaultFormat);
    setShowExportModal(false);
  };

  const dataStats = getDataStats();

  return (
    <div className="space-y-6">
      <SettingsHeader
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveSettings}
        onReset={resetSettings}
      />

      <SettingsSections
        settings={settings}
        darkMode={state.darkMode}
        dataStats={dataStats}
        onUpdateSettings={updateSettings}
        onToggleDarkMode={toggleDarkMode}
        onShowExportModal={() => setShowExportModal(true)}
        onShowResetModal={() => setShowResetModal(true)}
      />

      <SettingsModals
        showResetModal={showResetModal}
        showExportModal={showExportModal}
        dataStats={dataStats}
        exportFormat={settings.export.defaultFormat}
        onCloseResetModal={() => setShowResetModal(false)}
        onCloseExportModal={() => setShowExportModal(false)}
        onResetData={handleResetData}
        onExportFormatChange={(format) => updateSettings('export', { defaultFormat: format })}
        onExportData={handleExportData}
      />
    </div>
  );
}
