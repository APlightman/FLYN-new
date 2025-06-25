import React from 'react';

export function AppInfo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Версия:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">1.0.0</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Последнее обновление:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {new Date().toLocaleDateString('ru-RU')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Разработчик:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">FinanceTracker Team</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Лицензия:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">MIT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Поддержка:</span>
          <span className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
            support@financetracker.com
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Сайт:</span>
          <span className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
            financetracker.com
          </span>
        </div>
      </div>
    </div>
  );
}