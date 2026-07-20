import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ExportModal } from '../import-export/ExportModal';

interface DataStats {
  transactions: number;
  categories: number;
  goals: number;
  budgets: number;
  recurringPayments: number;
}

interface SettingsModalsProps {
  showResetModal: boolean;
  showExportModal: boolean;
  dataStats: DataStats;
  onCloseResetModal: () => void;
  onCloseExportModal: () => void;
  onResetData: () => void;
}

export function SettingsModals({
  showResetModal,
  showExportModal,
  dataStats,
  onCloseResetModal,
  onCloseExportModal,
  onResetData
}: SettingsModalsProps) {
  return (
    <>
      {/* Модальное окно сброса данных */}
      <Modal
        isOpen={showResetModal}
        onClose={onCloseResetModal}
        title="Сброс всех данных"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            <div>
              <div className="font-semibold text-red-800 dark:text-red-200">
                Внимание! Это действие необратимо
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Все ваши данные будут удалены безвозвратно
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-700 dark:text-slate-300">
              Будут удалены:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>{dataStats.transactions} транзакций</li>
              <li>{dataStats.categories} категорий</li>
              <li>{dataStats.goals} финансовых целей</li>
              <li>{dataStats.budgets} бюджетов</li>
              <li>Все настройки приложения</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onCloseResetModal}
              fullWidth
            >
              <X size={16} className="mr-2" />
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={onResetData}
              fullWidth
            >
              <Trash2 size={16} className="mr-2" />
              Удалить все данные
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно экспорта */}
      <Modal
        isOpen={showExportModal}
        onClose={onCloseExportModal}
        title="Экспорт всех данных"
      >
        <ExportModal
          onClose={onCloseExportModal}
          initialDataType="all"
          initialFormat="json"
        />
      </Modal>
    </>
  );
}
