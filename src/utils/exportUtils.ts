import { Transaction, Category, Budget, FinancialGoal, RecurringPayment } from '../types';

const escapeHtml = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export const generatePrintableHTML = (data: Record<string, unknown>[], title: string): string => {
  const headers = Object.keys(data[0]);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2563eb; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Создано: ${new Date().toLocaleDateString('ru-RU')}</p>
  <table>
    <thead>
      <tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.map(row => `<tr>${headers.map(h => `<td>${escapeHtml(row[h])}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
</body>
</html>`;
};

export const prepareTransactionsForExport = (transactions: Transaction[]) => 
  transactions.map(t => ({
    'Дата': t.date,
    'Тип': t.type === 'income' ? 'Доход' : 'Расход',
    'Сумма': t.amount,
    'Категория': t.category,
    'Описание': t.description,
    'Теги': t.tags?.join(', ') || ''
  }));

export const prepareCategoriesForExport = (categories: Category[]) => 
  categories.map(c => ({
    'Название': c.name,
    'Тип': c.type === 'income' ? 'Доход' : 'Расход',
    'Цвет': c.color,
    'Бюджет': c.budget || 0
  }));

export const prepareGoalsForExport = (goals: FinancialGoal[]) => 
  goals.map(g => ({
    'Название': g.name,
    'Целевая сумма': g.targetAmount,
    'Текущая сумма': g.currentAmount,
    'Дедлайн': g.deadline,
    'Ежемесячный взнос': g.monthlyContribution,
    'Приоритет': g.priority === 'high' ? 'Высокий' : g.priority === 'medium' ? 'Средний' : 'Низкий'
  }));

export const prepareBudgetsForExport = (budgets: Budget[]) => 
  budgets.map(b => ({
    'ID категории': b.categoryId,
    'Сумма': b.amount,
    'Период': b.period === 'monthly' ? 'Месячный' : 'Годовой',
    'Потрачено': b.spent,
    'Остаток': b.remaining
  }));

export const prepareRecurringPaymentsForExport = (payments: RecurringPayment[]) =>
  payments.map(payment => ({
    'Название': payment.name,
    'Сумма': payment.amount,
    'Категория': payment.category,
    'Периодичность': payment.frequency,
    'Следующая дата': payment.nextDate,
    'Активен': payment.isActive ? 'Да' : 'Нет',
    'Описание': payment.description || '',
  }));
