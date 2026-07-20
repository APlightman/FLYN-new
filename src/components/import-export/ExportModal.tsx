import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { generatePrintableHTML } from '../../utils/exportUtils';
import { ExportDataProcessor, type ExportFormat } from '../desktop/ExportDataProcessor';
import { useElectronIntegration } from '../../hooks/useElectronIntegration';

interface ExportModalProps {
  onClose: () => void;
  initialDataType?: string;
  initialFormat?: ExportFormat;
}

export function ExportModal({ onClose, initialDataType = 'transactions', initialFormat = 'csv' }: ExportModalProps) {
  const { state } = useApp();
  const { isElectron, exportPdf, saveFile, showSaveDialog } = useElectronIntegration();
  const [dataType, setDataType] = useState(initialDataType);
  const [format, setFormat] = useState<ExportFormat>(initialFormat);
  const [isExporting, setIsExporting] = useState(false);

  const dataTypeOptions = [
    { value: 'transactions', label: 'Транзакции' },
    { value: 'categories', label: 'Категории' },
    { value: 'goals', label: 'Финансовые цели' },
    { value: 'budgets', label: 'Бюджеты' },
    { value: 'recurringPayments', label: 'Регулярные платежи' },
    { value: 'all', label: 'Все данные' }
  ];

  const allFormatOptions = [
    { value: 'csv', label: 'CSV файл' },
    { value: 'json', label: 'JSON файл' },
    { value: 'tsv', label: 'TSV файл' },
    { value: 'pdf', label: 'PDF отчёт' },
  ];

  const processor = useMemo(() => new ExportDataProcessor(state), [state]);
  const supportedFormats = processor.getSupportedFormats(dataType);
  const formatOptions = allFormatOptions.filter(option => supportedFormats.includes(option.value as ExportFormat));
  const effectiveFormat = supportedFormats.includes(format) ? format : supportedFormats[0];

  useEffect(() => {
    if (!supportedFormats.includes(format)) {
      setFormat(supportedFormats[0]);
    }
  }, [format, supportedFormats]);

  const handleExport = async () => {
    if (!isElectron) {
      alert('Экспорт файлов доступен только в десктопной версии приложения');
      return;
    }

    setIsExporting(true);
    
    try {
      const { data, rawData, filename, title } = processor.getDataForExport(dataType);
      
      if (!Array.isArray(data) || data.length === 0) {
        if (dataType !== 'all') {
          alert('Нет данных для экспорта');
          return;
        }
      }

      if (dataType === 'all' && getDataCount() === 0) {
        alert('Нет данных для экспорта');
        return;
      }

      const now = new Date();
      const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-') + '_' + [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
        String(now.getMilliseconds()).padStart(3, '0'),
      ].join('-');
      const defaultPath = `${filename}_${timestamp}.${processor.getFileExtension(effectiveFormat)}`;
      const dialogResult = await showSaveDialog({
        defaultPath,
        filters: processor.getFileFilters(effectiveFormat),
      });

      if (!dialogResult || dialogResult.canceled || !dialogResult.filePath) {
        return;
      }

      const result = effectiveFormat === 'pdf'
        ? await exportPdf(dialogResult.filePath, generatePrintableHTML(data as Record<string, unknown>[], title))
        : await saveFile(
          dialogResult.filePath,
          processor.formatContent(effectiveFormat === 'json' ? rawData : data, effectiveFormat),
        );

      if (!result.success) {
        alert(`Ошибка сохранения: ${result.error || 'неизвестная ошибка'}`);
        return;
      }

      alert(`Файл сохранён: ${dialogResult.filePath}`);
      onClose();
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Произошла ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  const getDataCount = () => {
    if (dataType === 'all') {
      return state.transactions.length + state.categories.length + state.goals.length + state.budgets.length + state.recurringPayments.length;
    }
    return processor.getDataCount(dataType);
  };

  const getFormatIcon = () => {
    switch (effectiveFormat) {
      case 'csv':
        return <FileText size={16} />;
      case 'tsv':
        return <FileSpreadsheet size={16} />;
      case 'pdf':
        return <File size={16} />;
      default:
        return <Download size={16} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Select
          label="Тип данных"
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          options={dataTypeOptions}
          fullWidth
        />

        <Select
          label="Формат файла"
          value={effectiveFormat}
          onChange={(e) => setFormat(e.target.value as ExportFormat)}
          options={formatOptions}
          fullWidth
        />
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {getFormatIcon()}
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Предварительный просмотр экспорта
          </span>
        </div>
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p>Тип данных: {dataTypeOptions.find(opt => opt.value === dataType)?.label}</p>
          <p>Формат: {formatOptions.find(opt => opt.value === effectiveFormat)?.label}</p>
          <p>Количество записей: {getDataCount()}</p>
        </div>
      </div>

      {dataType === 'all' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Полная резервная копия сохраняется в JSON, чтобы сохранить все поля и связи между данными.
          </p>
        </div>
      )}

      {effectiveFormat === 'pdf' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            PDF будет создан как готовый файл в выбранной папке.
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleExport}
          disabled={isExporting || getDataCount() === 0}
          fullWidth
        >
          {isExporting ? (
            'Экспортирование...'
          ) : (
            <>
              <Download size={16} className="mr-2" />
              Экспортировать
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
