import { Transaction, Category, Budget, FinancialGoal } from '../types';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = async (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join('\t'),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? value.replace(/\t/g, ' ') : value;
      }).join('\t')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (data: any[], filename: string, title: string) => {
  if (data.length === 0) {
    alert('Нет данных для экспорта в PDF');
    return;
  }

  const htmlContent = generatePrintableHTML(data, title);
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Разрешите всплывающие окна для экспорта PDF');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 1000);
    }, 500);
  };
};

const generatePrintableHTML = (data: any[], title: string): string => {
  const headers = Object.keys(data[0]);
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);

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
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
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
