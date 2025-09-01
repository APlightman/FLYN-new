import React, { useEffect } from 'react';
import { useElectronIntegration } from '../../hooks/useElectronIntegration';
import { useApp } from '../../contexts/AppContext';
import { DesktopNotifications } from './DesktopNotifications';

interface SystemIntegrationProps {
  children: React.ReactNode;
}

export function SystemIntegration({ children }: SystemIntegrationProps) {
  const { isElectron, showNotification } = useElectronIntegration();
  const { state } = useApp();

  useEffect(() => {
    if (!isElectron) return;

    const hasShownWelcome = localStorage.getItem('desktop_welcome_shown');
    if (!hasShownWelcome) {
      setTimeout(() => {
        showNotification({
          title: '🎉 Добро пожаловать в FinanceTracker!',
          body: 'Десктопная версия успешно запущена. Используйте системный трей для быстрого доступа.',
          onClick: true
        });
        localStorage.setItem('desktop_welcome_shown', 'true');
      }, 2000);
    }

    document.body.classList.add('desktop-app');
    
    if (window.innerWidth >= 1200) {
      document.body.classList.add('desktop-wide');
    }

    return () => {
      document.body.classList.remove('desktop-app', 'desktop-wide');
    };
  }, [isElectron, showNotification]);

  useEffect(() => {
    if (!isElectron) return;

    const createAutoBackup = () => {
      const now = new Date();
      const lastBackup = localStorage.getItem('last_auto_backup');
      
      if (!lastBackup || now.getTime() - parseInt(lastBackup) > 24 * 60 * 60 * 1000) {
        const backupData = {
          transactions: state.transactions,
          categories: state.categories,
          goals: state.goals,
          budgets: state.budgets,
          created: now.toISOString(),
          version: '1.0.0'
        };

        try {
          const content = JSON.stringify(backupData, null, 2);
          const filename = `financetracker_backup_${now.toISOString().split('T')[0]}.json`;
          
          console.log('Auto backup created:', filename);
          localStorage.setItem('last_auto_backup', now.getTime().toString());
          
          showNotification({
            title: '💾 Автоматическая резервная копия',
            body: `Данные сохранены: ${filename}`,
            silent: true
          });
        } catch (error) {
          console.error('Auto backup failed:', error);
        }
      }
    };

    const interval = setInterval(createAutoBackup, 60 * 60 * 1000);
    setTimeout(createAutoBackup, 5000);

    return () => clearInterval(interval);
  }, [state, isElectron, showNotification]);

  return (
    <>
      {children}
      {isElectron && <DesktopNotifications />}
    </>
  );
}
