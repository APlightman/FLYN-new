import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from '../mobile/MobileNavigation';
import { MobileHeader } from '../mobile/MobileHeader';
import { Dashboard } from '../dashboard/Dashboard';
import { TransactionList } from '../transactions/TransactionList';
import { BudgetManager } from '../budget/BudgetManager';
import { GoalsManager } from '../goals/GoalsManager';
import { Analytics } from '../analytics/Analytics';
import { CalculatorHub } from '../calculator/CalculatorHub';
import { CategoriesManager } from '../categories/CategoriesManager';
import { ImportExportManager } from '../import-export/ImportExportManager';
import { RecurringPaymentsManager } from '../recurring/RecurringPaymentsManager';
import { Calendar } from '../calendar/Calendar';
import { Settings } from '../settings/Settings';
import { FAQ } from '../faq/FAQ';
import { DesktopIntegration } from '../desktop/DesktopIntegration';
import { SystemIntegration } from '../desktop/SystemIntegration';
import { SETTINGS_STORAGE_KEY } from '../settings/settingsTypes';
import type { SettingsState } from '../settings/settingsTypes';

export function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarBehavior, setSidebarBehavior] = useState<'fixed' | 'collapse-hover' | 'collapse-click'>('fixed');
  const { state } = useApp();

  // Загружаем sidebarBehavior из настроек
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<SettingsState>;
        if (parsed.sidebarBehavior) {
          setSidebarBehavior(parsed.sidebarBehavior);
        }
      }
    } catch {
      // используем значение по умолчанию
    }
  }, []);

  // Слушаем событие сохранения настроек
  useEffect(() => {
    const handleSettingsSaved = (e: CustomEvent<SettingsState>) => {
      if (e.detail?.sidebarBehavior) {
        setSidebarBehavior(e.detail.sidebarBehavior);
      }
    };
    window.addEventListener('settingsSaved', handleSettingsSaved as EventListener);
    return () => window.removeEventListener('settingsSaved', handleSettingsSaved as EventListener);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Главная',
      transactions: 'Транзакции',
      budget: 'Бюджет',
      goals: 'Цели',
      recurring: 'Регулярные',
      analytics: 'Аналитика',
      calendar: 'Календарь',
      calculator: 'Калькулятор',
      categories: 'Категории',
      'import-export': 'Импорт/Экспорт',
      faq: 'ЧаВо',
      settings: 'Настройки',
    };
    return titles[activeTab] || 'FinanceTracker';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionList />;
      case 'budget':
        return <BudgetManager />;
      case 'goals':
        return <GoalsManager />;
      case 'recurring':
        return <RecurringPaymentsManager />;
      case 'analytics':
        return <Analytics />;
      case 'calendar':
        return <Calendar />;
      case 'calculator':
        return <CalculatorHub />;
      case 'categories':
        return <CategoriesManager />;
      case 'import-export':
        return <ImportExportManager />;
      case 'faq':
        return <FAQ />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SystemIntegration>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="flex h-screen">
          {!isMobile && (
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              behavior={sidebarBehavior}
            />
          )}
          
          <div className="flex-1 flex flex-col min-w-0">
            {isMobile ? (
              <MobileHeader
                title={getPageTitle()}
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                showSearch={activeTab === 'transactions'}
                showNotifications={true}
                notificationCount={0}
              />
            ) : (
              <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            )}
            
            <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
              {renderContent()}
            </main>
          </div>

          {isMobile && (
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </div>
        
        {isMobile && (
          <MobileNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        <DesktopIntegration
          onNavigate={setActiveTab}
          activeTab={activeTab}
        />
      </div>
    </SystemIntegration>
  );
}
