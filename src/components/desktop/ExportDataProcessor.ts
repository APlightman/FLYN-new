import { AppState } from '../../types';
import {
  prepareTransactionsForExport,
  prepareCategoriesForExport,
  prepareGoalsForExport,
  prepareBudgetsForExport,
  prepareRecurringPaymentsForExport,
} from '../../utils/exportUtils';

type ExportableData = object[] | object;
export type ExportFormat = 'csv' | 'json' | 'tsv' | 'pdf';

export class ExportDataProcessor {
  constructor(private state: AppState) {}

  getDataForExport(dataType: string) {
    switch (dataType) {
      case 'transactions':
        return {
          data: prepareTransactionsForExport(this.state.transactions),
          rawData: this.state.transactions,
          filename: 'transactions',
          title: 'Транзакции'
        };
      case 'categories':
        return {
          data: prepareCategoriesForExport(this.state.categories),
          rawData: this.state.categories,
          filename: 'categories',
          title: 'Категории'
        };
      case 'goals':
        return {
          data: prepareGoalsForExport(this.state.goals),
          rawData: this.state.goals,
          filename: 'goals',
          title: 'Финансовые цели'
        };
      case 'budgets':
        return {
          data: prepareBudgetsForExport(this.state.budgets),
          rawData: this.state.budgets,
          filename: 'budgets',
          title: 'Бюджеты'
        };
      case 'recurringPayments':
        return {
          data: prepareRecurringPaymentsForExport(this.state.recurringPayments),
          rawData: this.state.recurringPayments,
          filename: 'recurring_payments',
          title: 'Регулярные платежи'
        };
      case 'all':
        return {
          data: {
            transactions: this.state.transactions,
            categories: this.state.categories,
            goals: this.state.goals,
            budgets: this.state.budgets,
            recurringPayments: this.state.recurringPayments,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
          },
          rawData: {
            transactions: this.state.transactions,
            categories: this.state.categories,
            goals: this.state.goals,
            budgets: this.state.budgets,
            recurringPayments: this.state.recurringPayments,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
          },
          filename: 'financetracker_backup',
          title: 'Полная резервная копия'
        };
      default:
        return { data: [], rawData: [], filename: 'export', title: 'Экспорт' };
    }
  }

  formatContent(data: ExportableData, format: Exclude<ExportFormat, 'pdf'>) {
    switch (format) {
      case 'csv':
        return this.formatAsCSV(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'tsv':
        return this.formatAsTSV(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private formatAsCSV(data: ExportableData) {
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0] as Record<string, unknown>);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = (row as Record<string, unknown>)[header];
            const stringValue = typeof value === 'string'
              ? value
              : value === undefined || value === null
                ? ''
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value);
            if (/[",\n\r]/.test(stringValue)) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ].join('\n');
      return '\uFEFF' + csvContent;
    }
    return '';
  }

  private formatAsTSV(data: ExportableData) {
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0] as Record<string, unknown>);
      const tsvContent = [
        headers.join('\t'),
        ...data.map(row => 
          headers.map(header => {
            const value = (row as Record<string, unknown>)[header];
            const stringValue = typeof value === 'string'
              ? value
              : value === undefined || value === null
                ? ''
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value);
            return stringValue.replace(/[\t\n\r]/g, ' ');
          }).join('\t')
        )
      ].join('\n');
      return '\uFEFF' + tsvContent;
    }
    return '';
  }

  getFileExtension(format: ExportFormat) {
    switch (format) {
      case 'csv': return 'csv';
      case 'json': return 'json';
      case 'tsv': return 'tsv';
      case 'pdf': return 'pdf';
      default: return 'txt';
    }
  }

  getFileFilters(format: ExportFormat) {
    switch (format) {
      case 'csv':
        return [
          { name: 'CSV файлы', extensions: ['csv'] },
          { name: 'Все файлы', extensions: ['*'] }
        ];
      case 'json':
        return [
          { name: 'JSON файлы', extensions: ['json'] },
          { name: 'Все файлы', extensions: ['*'] }
        ];
      case 'tsv':
        return [
          { name: 'TSV файлы', extensions: ['tsv'] },
          { name: 'Текстовые файлы', extensions: ['txt'] },
          { name: 'Все файлы', extensions: ['*'] }
        ];
      case 'pdf':
        return [
          { name: 'PDF файлы', extensions: ['pdf'] },
          { name: 'Все файлы', extensions: ['*'] }
        ];
      default:
        return [{ name: 'Все файлы', extensions: ['*'] }];
    }
  }

  getDataCount(dataType: string) {
    const { data } = this.getDataForExport(dataType);
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object' && data !== null) return Object.keys(data).length;
    return 0;
  }

  getSupportedFormats(dataType: string): ExportFormat[] {
    return dataType === 'all' ? ['json'] : ['csv', 'json', 'tsv', 'pdf'];
  }
}
