import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { GeneralSettings } from './GeneralSettings';
import { NotificationSettings } from './NotificationSettings';
import { ExportSettings } from './ExportSettings';
import { PrivacySettings } from './PrivacySettings';
import { DataManagement } from './DataManagement';
import { DatabaseSettings } from './DatabaseSettings';
import { AppInfo } from './AppInfo';
import { SidebarSettings } from './SidebarSettings';
import { MobileMenuSettings } from './MobileMenuSettings';
import { SettingsState, DataStats } from './settingsTypes';
import { 
  Globe, 
  Bell, 
  Download, 
  Shield, 
  Database, 
  Info,
  Eye,
  Smartphone,
  Server
} from 'lucide-react';

interface SettingsSectionsProps {
  settings: SettingsState;
  darkMode: boolean;
  dataStats: DataStats;
  onUpdateSettings: (section: keyof SettingsState, updates: any) => void;
  onToggleDarkMode: () => void;
  onShowExportModal: () => void;
  onShowResetModal: () => void;
}

export function SettingsSections({
  settings,
  darkMode,
  dataStats,
  onUpdateSettings,
  onToggleDarkMode,
  onShowExportModal,
  onShowResetModal
}: SettingsSectionsProps) {
  return (
    <>
      <CollapsibleSection
        title="Общие настройки"
        icon={<Globe className="text-blue-600 dark:text-blue-400" size={20} />}
        defaultExpanded={false}
      >
        <GeneralSettings
          settings={{
            language: settings.language,
            currency: settings.currency,
            dateFormat: settings.dateFormat,
          }}
          darkMode={darkMode}
          onUpdateSettings={(updates) => {
            const key = 'language' in updates ? 'language' : 
                      'currency' in updates ? 'currency' : 'dateFormat';
            onUpdateSettings(key, updates);
          }}
          onToggleDarkMode={onToggleDarkMode}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="База данных"
        icon={<Server className="text-green-600 dark:text-green-400" size={20} />}
        defaultExpanded={false}
      >
        <DatabaseSettings />
      </CollapsibleSection>

      <CollapsibleSection
        title="Настройки мобильного меню"
        icon={<Smartphone className="text-blue-600 dark:text-blue-400" size={20} />}
        defaultExpanded={false}
      >
        <MobileMenuSettings
          mobileMenuItems={settings.mobileMenuItems}
          onUpdateItems={(updates) => onUpdateSettings('mobileMenuItems', updates)}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Настройки боковой панели"
        icon={<Eye className="text-indigo-600 dark:text-indigo-400" size={20} />}
        defaultExpanded={false}
      >
        <SidebarSettings
          sidebarTabs={settings.sidebarTabs}
          onUpdateTabs={(updates) => onUpdateSettings('sidebarTabs', updates)}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Уведомления"
        icon={<Bell className="text-green-600 dark:text-green-400" size={20} />}
        defaultExpanded={false}
      >
        <NotificationSettings
          notifications={settings.notifications}
          onUpdateNotifications={(updates) => onUpdateSettings('notifications', updates)}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Настройки экспорта"
        icon={<Download className="text-purple-600 dark:text-purple-400" size={20} />}
        defaultExpanded={false}
      >
        <ExportSettings
          exportSettings={settings.export}
          onUpdateExportSettings={(updates) => onUpdateSettings('export', updates)}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Приватность и безопасность"
        icon={<Shield className="text-orange-600 dark:text-orange-400" size={20} />}
        defaultExpanded={false}
      >
        <PrivacySettings
          privacy={settings.privacy}
          onUpdatePrivacy={(updates) => onUpdateSettings('privacy', updates)}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Управление данными"
        icon={<Database className="text-indigo-600 dark:text-indigo-400" size={20} />}
        defaultExpanded={false}
      >
        <DataManagement
          dataStats={dataStats}
          onShowExportModal={onShowExportModal}
          onShowResetModal={onShowResetModal}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="О приложении"
        icon={<Info className="text-slate-600 dark:text-slate-400" size={20} />}
        defaultExpanded={false}
      >
        <AppInfo />
      </CollapsibleSection>
    </>
  );
}
