import { describe, expect, it } from 'vitest';
import { ExportDataProcessor } from '../../src/components/desktop/ExportDataProcessor';
import { importCategories, importTransactions, validateFile } from '../../src/utils/importUtils';
import type { AppState } from '../../src/types';

const state: AppState = {
  transactions: [
    {
      id: 'transaction-1',
      type: 'expense',
      amount: 123.45,
      category: 'Продукты',
      description: 'Кофе, завтрак',
      date: '2026-07-14',
      tags: ['еда', 'утро'],
    },
  ],
  categories: [
    { id: 'category-1', name: 'Продукты', type: 'expense', color: '#111111' },
  ],
  budgets: [],
  goals: [],
  recurringPayments: [
    {
      id: 'payment-1',
      name: 'Подписка',
      amount: 299,
      category: 'Подписки',
      frequency: 'monthly',
      nextDate: '2026-08-14',
      isActive: true,
    },
  ],
  filters: { dateRange: { start: '', end: '' }, categories: [] },
  darkMode: false,
  selectedDate: null,
};

describe('CSV import/export', () => {
  it('сохраняет экранированные CSV-поля при экспорте и импорте транзакций', () => {
    const processor = new ExportDataProcessor(state);
    const { data } = processor.getDataForExport('transactions');
    const csv = processor.formatContent(data, 'csv');

    const result = importTransactions(csv);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([
      {
        type: 'expense',
        amount: 123.45,
        category: 'Продукты',
        description: 'Кофе, завтрак',
        date: '2026-07-14',
        tags: ['еда', 'утро'],
      },
    ]);
  });

  it('сохраняет многострочные CSV-поля при импорте', () => {
    const result = importTransactions(
      'Дата,Тип,Сумма,Категория,Описание\n2026-07-14,Расход,123.45,Продукты,"Первая строка\nВторая строка"',
    );

    expect(result.success).toBe(true);
    expect(result.data[0]?.description).toBe('Первая строка\nВторая строка');
  });

  it('отклоняет CSV категорий без обязательных заголовков', () => {
    const result = importCategories('Дата,Сумма\n2026-07-14,123');

    expect(result).toMatchObject({
      success: false,
      errors: ['Отсутствуют обязательные колонки: Название, Тип'],
    });
  });

  it('включает recurring payments в полный JSON backup', () => {
    const processor = new ExportDataProcessor(state);
    const { data } = processor.getDataForExport('all');
    const backup = JSON.parse(processor.formatContent(data, 'json'));

    expect(backup.recurringPayments).toEqual(state.recurringPayments);
  });

  it('экспортирует полный набор полей отдельной сущности в JSON', () => {
    const processor = new ExportDataProcessor(state);
    const { rawData } = processor.getDataForExport('transactions');
    const exported = JSON.parse(processor.formatContent(rawData, 'json'));

    expect(exported).toEqual(state.transactions);
    expect(exported[0]).toMatchObject({ id: 'transaction-1', tags: ['еда', 'утро'] });
  });

  it('формирует TSV с корректным расширением и без табуляций внутри поля', () => {
    const processor = new ExportDataProcessor({
      ...state,
      transactions: [{ ...state.transactions[0], description: 'Кофе\tи завтрак' }],
    });
    const { data } = processor.getDataForExport('transactions');
    const tsv = processor.formatContent(data, 'tsv');

    expect(processor.getFileExtension('tsv')).toBe('tsv');
    expect(tsv).toContain('Кофе и завтрак');
  });

  it('предлагает JSON только для полной резервной копии', () => {
    const processor = new ExportDataProcessor(state);

    expect(processor.getSupportedFormats('all')).toEqual(['json']);
    expect(processor.getSupportedFormats('transactions')).toContain('pdf');
  });

  it('принимает только поддерживаемый CSV формат импорта', () => {
    expect(validateFile({ name: 'transactions.csv', size: 1024 } as File).valid).toBe(true);
    expect(validateFile({ name: 'transactions.xlsx', size: 1024 } as File)).toEqual({
      valid: false,
      error: 'Используйте CSV файлы',
    });
  });
});
