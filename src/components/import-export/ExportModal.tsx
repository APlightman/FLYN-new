import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { 
  exportToCSV, 
  exportToExcel, 
  exportToPDF,
  prepareTransactionsForExport,
  prepareCategoriesForExport,
  prepareGoalsForExport,
  prepareBudgetsForExport
} from '../../utils/exportUtils';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { state } = useApp();
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
    { value: 'excel', label: 'Excel файл' },
    { value: 'pdf', label: 'PDF отчёт' }
  ];

  const getDataForExport = () => {
    switch (dataType) {
      case 'transactions':
        return {
          data: prepareTransactionsForExport(state.transactions),
          filename: 'transactions',
          title: 'Отчёт по транзакциям'
        };
      case 'categories':
        return {
          data: prepareCategoriesForExport(state.categories),
          filename: 'categories',
          title: 'Отчёт по категориям'
        };
      case 'goals':
        return {
          data: prepareGoalsForExport(state.goals),
          filename: 'goals',
          title: 'Отчёт по финансовым целям'
        };
      case 'budgets':
        return {
          data: prepareBudgetsForExport(state.budgets),
          filename: 'budgets',
          title: 'Отчёт по бюджетам'
        };
      case 'all':
        return {
          data: [
            ...prepareTransactionsForExport(state.transactions),
            ...prepareCategoriesForExport(state.categories),
            ...prepareGoalsForExport(state.goals),
            ...prepareBudgetsForExport(state.budgets)
          ],
          filename: 'all_data',
          title: 'Полный отчёт по финансам'
        };
      default:
        return { data: [], filename: 'export', title: 'Экспорт данных' };
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const { data, filename, title } = getDataForExport();
      
      if (data.length === 0) {
        alert('Нет данных для экспорта');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}_${timestamp}`;

      switch (format) {
        case 'csv':
          exportToCSV(data, fullFilename);
          break;
        case 'excel':
          await exportToExcel(data, fullFilename);
          break;
        case 'pdf':
          await exportToPDF(data, fullFilename, title);
          break;
      }

      onClose();
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Произошла ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  const getDataCount = () => {
    const { data } = getDataForExport();
    return data.length;
  };

  const getFormatIcon = () => {
    switch (format) {
      case 'csv':
        return <FileText size={16} />;
      case 'excel':
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
          value={format}
          onChange={(e) => setFormat(e.target.value)}
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
          <p>Формат: {formatOptions.find(opt => opt.value === format)?.label}</p>
          <p>Количество записей: {getDataCount()}</p>
        </div>
      </div>

      {format === 'pdf' && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Примечание:</strong> PDF файл откроется в новом окне для печати или сохранения.
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
