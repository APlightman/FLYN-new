import React, { useState } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ImportModal } from './ImportModal';
import { ExportModal } from './ExportModal';

export function ImportExportManager() {
  const { state } = useApp();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const getDataStats = () => {
    return {
      transactions: state.transactions.length,
      categories: state.categories.length,
      goals: state.goals.length,
      budgets: state.budgets.length
    };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Импорт и экспорт данных
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Download className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Экспорт данных
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Сохраните данные в различных форматах
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Транзакции
                </span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {stats.transactions} записей
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <File size={16} className="text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Категории
                </span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {stats.categories} записей
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Финансовые цели
                </span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {stats.goals} записей
              </span>
            </div>
          </div>

          <Button onClick={() => setShowExportModal(true)} fullWidth>
            <Download size={16} className="mr-2" />
            Экспортировать данные
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Upload className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Импорт данных
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Загрузите данные из файлов CSV/Excel
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Поддерживаемые форматы:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• CSV файлы (.csv)</li>
                <li>• Excel файлы (.xls, .xlsx)</li>
                <li>• Максимальный размер: 10MB</li>
              </ul>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Требования к данным:
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Первая строка - заголовки</li>
                <li>• Обязательные поля должны быть заполнены</li>
                <li>• Даты в формате YYYY-MM-DD</li>
              </ul>
            </div>
          </div>

          <Button onClick={() => setShowImportModal(true)} fullWidth>
            <Upload size={16} className="mr-2" />
            Импортировать данные
          </Button>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Шаблоны для импорта
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Скачайте шаблоны CSV файлов для правильного импорта данных:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="secondary" 
            onClick={() => downloadTemplate('transactions')}
            className="justify-start"
          >
            <FileText size={16} className="mr-2" />
            Шаблон транзакций
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => downloadTemplate('categories')}
            className="justify-start"
          >
            <File size={16} className="mr-2" />
            Шаблон категорий
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => downloadTemplate('goals')}
            className="justify-start"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Шаблон целей
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Экспорт данных"
      >
        <ExportModal onClose={() => setShowExportModal(false)} />
      </Modal>

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Импорт данных"
      >
        <ImportModal onClose={() => setShowImportModal(false)} />
      </Modal>
    </div>
  );
}

const downloadTemplate = (type: 'transactions' | 'categories' | 'goals') => {
  let csvContent = '';
  let filename = '';

  switch (type) {
    case 'transactions':
      csvContent = 'Дата,Тип,Сумма,Категория,Описание,Теги\n2024-01-01,Расход,1000,Продукты,Покупка в магазине,еда\n2024-01-02,Доход,50000,Зарплата,Месячная зарплата,работа';
      filename = 'template_transactions';
      break;
    case 'categories':
      csvContent = 'Название,Тип,Цвет,Бюджет\nПродукты,Расход,#ef4444,15000\nЗарплата,Доход,#22c55e,';
      filename = 'template_categories';
      break;
    case 'goals':
      csvContent = 'Название,Целевая сумма,Текущая сумма,Дедлайн,Ежемесячный взнос,Приоритет,Описание\nОтпуск,100000,25000,2024-12-31,10000,Высокий,Поездка в Европу';
      filename = 'template_goals';
      break;
  }

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
