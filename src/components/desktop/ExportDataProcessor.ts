import { AppState } from '../../types';
import {
  prepareTransactionsForExport,
  prepareCategoriesForExport,
  prepareGoalsForExport,
  prepareBudgetsForExport
} from '../../utils/exportUtils';

type ExportableData = Record<string, unknown>[] | Record<string, unknown>;

export class ExportDataProcessor {
  constructor(private state: AppState) {}

  getDataForExport(dataType: string) {
    switch (dataType) {
      case 'transactions':
        return {
          data: prepareTransactionsForExport(this.state.transactions),
          filename: 'transactions',
          title: 'Транзакции'
        };
      case 'categories':
        return {
          data: prepareCategoriesForExport(this.state.categories),
          filename: 'categories',
          title: 'Категории'
        };
      case 'goals':
        return {
          data: prepareGoalsForExport(this.state.goals),
          filename: 'goals',
          title: 'Финансовые цели'
        };
      case 'budgets':
        return {
          data: prepareBudgetsForExport(this.state.budgets),
          filename: 'budgets',
          title: 'Бюджеты'
        };
      case 'all':
        return {
          data: {
            transactions: this.state.transactions,
            categories: this.state.categories,
            goals: this.state.goals,
            budgets: this.state.budgets,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
          },
          filename: 'financetracker_backup',
          title: 'Полная резервная копия'
        };
      default:
        return { data: [], filename: 'export', title: 'Экспорт' };
    }
  }

  formatContent(data: ExportableData, format: string) {
    switch (format) {
      case 'csv':
        return this.formatAsCSV(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'excel':
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
            const value = (row as Record<string, any>)[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
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
            const value = (row as Record<string, any>)[header];
            return typeof value === 'string' ? value.replace(/\t/g, ' ') : value;
          }).join('\t')
        )
      ].join('\n');
      return '\uFEFF' + tsvContent;
    }
    return '';
  }

  getFileExtension(format: string) {
    switch (format) {
      case 'csv': return 'csv';
      case 'json': return 'json';
      case 'excel': return 'tsv';
      default: return 'txt';
    }
  }

  getFileFilters(format: string) {
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
      case 'excel':
        return [
          { name: 'TSV файлы', extensions: ['tsv'] },
          { name: 'Текстовые файлы', extensions: ['txt'] },
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
}