import React from 'react';

interface NotificationSettingsProps {
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    recurringPayments: boolean;
    weeklyReports: boolean;
  };
  onUpdateNotifications: (updates: any) => void;
}

export function NotificationSettings({ notifications, onUpdateNotifications }: NotificationSettingsProps) {
  const notificationLabels = {
    budgetAlerts: 'Предупреждения о превышении бюджета',
    goalReminders: 'Напоминания о финансовых целях',
    recurringPayments: 'Уведомления о регулярных платежах',
    weeklyReports: 'Еженедельные отчёты',
  };

  return (
    <div className="space-y-4">
      {Object.entries(notifications).map(([key, value]) => (
        <label key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-slate-300'}`} />
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {notificationLabels[key as keyof typeof notificationLabels]}
            </span>
          </div>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onUpdateNotifications({ [key]: e.target.checked })}
            className="rounded"
          />
        </label>
      ))}
    </div>
  );
}