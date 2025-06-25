import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface DataStats {
  transactions: number;
  categories: number;
  goals: number;
  budgets: number;
  recurringPayments: number;
  totalItems: number;
  storageSize: number;
}

interface DataManagementProps {
  dataStats: DataStats;
  onShowExportModal: () => void;
  onShowResetModal: () => void;
}

export function DataManagement({ dataStats, onShowExportModal, onShowResetModal }: DataManagementProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {dataStats.transactions}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Транзакций</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {dataStats.categories}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">Категорий</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {dataStats.goals}
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300">Целей</div>
        </div>
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {dataStats.budgets}
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">Бюджетов</div>
        </div>
        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
            {Math.round(dataStats.storageSize / 1024)}
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300">КБ данных</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onShowExportModal}
          className="flex-1"
        >
          <Download size={16} className="mr-2" />
          Экспорт всех данных
        </Button>
        <Button
          variant="danger"
          onClick={onShowResetModal}
          className="flex-1"
        >
          <Trash2 size={16} className="mr-2" />
          Сбросить данные
        </Button>
      </div>
    </div>
  );
}