import React from 'react';
import { AlertTriangle, Download, Check, X, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

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
  exportFormat: string;
  onCloseResetModal: () => void;
  onCloseExportModal: () => void;
  onResetData: () => void;
  onExportFormatChange: (format: string) => void;
  onExportData: () => void;
}

export function SettingsModals({
  showResetModal,
  showExportModal,
  dataStats,
  exportFormat,
  onCloseResetModal,
  onCloseExportModal,
  onResetData,
  onExportFormatChange,
  onExportData
}: SettingsModalsProps) {
  const exportFormatOptions = [
    { value: 'csv', label: 'CSV файл' },
    { value: 'excel', label: 'Excel файл' },
    { value: 'pdf', label: 'PDF отчёт' },
    { value: 'json', label: 'JSON данные' },
  ];

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
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Download className="text-blue-600 dark:text-blue-400" size={24} />
            <div>
              <div className="font-semibold text-blue-800 dark:text-blue-200">
                Создание резервной копии
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Все данные будут сохранены в выбранном формате
              </div>
            </div>
          </div>

          <Select
            label="Формат экспорта"
            value={exportFormat}
            onChange={(e) => onExportFormatChange(e.target.value)}
            options={exportFormatOptions}
            fullWidth
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onCloseExportModal}
              fullWidth
            >
              Отмена
            </Button>
            <Button
              onClick={onExportData}
              fullWidth
            >
              <Check size={16} className="mr-2" />
              Экспортировать
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}