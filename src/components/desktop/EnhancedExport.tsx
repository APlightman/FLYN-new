import React, { useState } from 'react';
import { Download, Save, RefreshCw } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useElectronIntegration } from '../../hooks/useElectronIntegration';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { ExportDataProcessor } from './ExportDataProcessor';

interface EnhancedExportProps {
  onClose: () => void;
}

export function EnhancedExport({ onClose }: EnhancedExportProps) {
  const { state } = useApp();
  const { isElectron, showSaveDialog, saveFile, systemInfo } = useElectronIntegration();
  const [dataType, setDataType] = useState('transactions');
  const [format, setFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);

  const dataTypeOptions = [
    { value: 'transactions', label: 'Транзакции' },
    { value: 'categories', label: 'Категории' },
    { value: 'goals', label: 'Финансовые цели' },
    { value: 'budgets', label: 'Бюджеты' },
    { value: 'all', label: 'Все данные' }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV файл' },
    { value: 'json', label: 'JSON файл' },
    { value: 'excel', label: 'Excel файл (TSV)' }
  ];

  const handleExport = async () => {
    if (!isElectron) {
      alert('Функция доступна только в десктопной версии');
      return;
    }

    setIsExporting(true);

    try {
      const processor = new ExportDataProcessor(state);
      const { data, filename } = processor.getDataForExport(dataType);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        alert('Нет данных для экспорта');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const defaultPath = `${filename}_${timestamp}.${processor.getFileExtension(format)}`;

      const result = await showSaveDialog({
        defaultPath,
        filters: processor.getFileFilters(format)
      });

      if (!result.canceled && result.filePath) {
        const content = processor.formatContent(data, format);
        const saveResult = await saveFile(result.filePath, content);

        if (saveResult.success) {
          alert(`Файл успешно сохранен: ${result.filePath}`);
          onClose();
        } else {
          alert(`Ошибка сохранения: ${saveResult.error}`);
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Произошла ошибка при экспорте');
    } finally {
      setIsExporting(false);
    }
  };

  const processor = new ExportDataProcessor(state);
  const dataCount = processor.getDataCount(dataType);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <Download className="text-blue-600 dark:text-blue-400" size={24} />
        <div>
          <div className="font-semibold text-blue-800 dark:text-blue-200">
            Улучшенный экспорт для десктопа
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            Сохранение прямо в файловую систему с выбором папки
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Тип данных"
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          options={dataTypeOptions}
          fullWidth
        />

        <Select
          label="Формат файла"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={formatOptions}
          fullWidth
        />
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
          <div><strong>Тип данных:</strong> {dataTypeOptions.find(opt => opt.value === dataType)?.label}</div>
          <div><strong>Формат:</strong> {formatOptions.find(opt => opt.value === format)?.label}</div>
          <div><strong>Записей:</strong> {dataCount}</div>
          <div><strong>Размещение:</strong> Выберете папку в диалоге сохранения</div>
        </div>
      </div>

      {systemInfo && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-sm text-green-800 dark:text-green-200">
            <strong>Десктопная версия:</strong> FinanceTracker {systemInfo.version} на {systemInfo.platform}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          variant="secondary"
          onClick={onClose}
          fullWidth
        >
          Отмена
        </Button>
        <Button
          onClick={handleExport}
          disabled={isExporting || dataCount === 0}
          fullWidth
        >
          {isExporting ? (
            <>
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Сохранить файл
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
