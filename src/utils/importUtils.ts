import { Transaction, Category } from '../types';

export interface ImportResult {
  success: boolean;
  data: any[];
  errors: string[];
  warnings: string[];
}

const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.split('\n');
  const result: string[][] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < trimmed.length; j++) {
      const char = trimmed[j];
      
      if (char === '"') {
        if (inQuotes && trimmed[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    result.push(row);
  }
  
  return result;
};

export const importTransactions = (csvText: string): ImportResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const transactions: Transaction[] = [];
  
  try {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: false, data: [], errors: ['Файл пуст'], warnings: [] };
    }
    
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);
    
    const requiredColumns = ['дата', 'тип', 'сумма', 'категория', 'описание'];
    const missingColumns = requiredColumns.filter(col => 
      !headers.some(h => h.includes(col))
    );
    
    if (missingColumns.length > 0) {
      errors.push(`Отсутствуют колонки: ${missingColumns.join(', ')}`);
      return { success: false, data: [], errors, warnings };
    }
    
    const getColumnIndex = (searchTerms: string[]) => 
      headers.findIndex(h => searchTerms.some(term => h.includes(term)));
    
    const dateIndex = getColumnIndex(['дата', 'date']);
    const typeIndex = getColumnIndex(['тип', 'type']);
    const amountIndex = getColumnIndex(['сумма', 'amount']);
    const categoryIndex = getColumnIndex(['категория', 'category']);
    const descriptionIndex = getColumnIndex(['описание', 'description']);
    const tagsIndex = getColumnIndex(['теги', 'tags']);
    
    dataRows.forEach((row, index) => {
      const rowNumber = index + 2;
      
      try {
        const dateStr = row[dateIndex]?.trim();
        if (!dateStr) {
          errors.push(`Строка ${rowNumber}: отсутствует дата`);
          return;
        }
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          errors.push(`Строка ${rowNumber}: неверная дата "${dateStr}"`);
          return;
        }
        
        const typeStr = row[typeIndex]?.trim().toLowerCase();
        let type: 'income' | 'expense';
        if (typeStr.includes('доход') || typeStr === 'income') {
          type = 'income';
        } else if (typeStr.includes('расход') || typeStr === 'expense') {
          type = 'expense';
        } else {
          errors.push(`Строка ${rowNumber}: неверный тип "${typeStr}"`);
          return;
        }
        
        const amountStr = row[amountIndex]?.trim().replace(/[^\d.,]/g, '');
        const amount = parseFloat(amountStr.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
          errors.push(`Строка ${rowNumber}: неверная сумма`);
          return;
        }
        
        const category = row[categoryIndex]?.trim();
        if (!category) {
          errors.push(`Строка ${rowNumber}: отсутствует категория`);
          return;
        }
        
        const description = row[descriptionIndex]?.trim() || 'Импорт';
        const tagsStr = tagsIndex >= 0 ? row[tagsIndex]?.trim() : '';
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
        
        transactions.push({
          id: crypto.randomUUID(),
          type,
          amount,
          category,
          description,
          date: date.toISOString().split('T')[0],
          tags: tags.length > 0 ? tags : undefined
        });
        
      } catch (error) {
        errors.push(`Строка ${rowNumber}: ошибка обработки`);
      }
    });
    
    return { success: errors.length === 0, data: transactions, errors, warnings };
    
  } catch (error) {
    return { success: false, data: [], errors: [`Ошибка парсинга: ${error}`], warnings: [] };
  }
};

export const importCategories = (csvText: string): ImportResult => {
  const errors: string[] = [];
  const categories: Category[] = [];
  
  try {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: false, data: [], errors: ['Файл пуст'], warnings: [] };
    }
    
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);
    
    const getColumnIndex = (searchTerms: string[]) => 
      headers.findIndex(h => searchTerms.some(term => h.includes(term)));
    
    const nameIndex = getColumnIndex(['название', 'name']);
    const typeIndex = getColumnIndex(['тип', 'type']);
    const colorIndex = getColumnIndex(['цвет', 'color']);
    
    dataRows.forEach((row, index) => {
      const rowNumber = index + 2;
      
      try {
        const name = row[nameIndex]?.trim();
        if (!name) {
          errors.push(`Строка ${rowNumber}: отсутствует название`);
          return;
        }
        
        const typeStr = row[typeIndex]?.trim().toLowerCase();
        let type: 'income' | 'expense';
        if (typeStr.includes('доход') || typeStr === 'income') {
          type = 'income';
        } else if (typeStr.includes('расход') || typeStr === 'expense') {
          type = 'expense';
        } else {
          errors.push(`Строка ${rowNumber}: неверный тип`);
          return;
        }
        
        const colorStr = row[colorIndex]?.trim();
        const color = colorStr && colorStr.startsWith('#') ? colorStr : '#6b7280';
        
        categories.push({
          id: crypto.randomUUID(),
          name,
          type,
          color
        });
        
      } catch (error) {
        errors.push(`Строка ${rowNumber}: ошибка обработки`);
      }
    });
    
    return { success: errors.length === 0, data: categories, errors, warnings: [] };
    
  } catch (error) {
    return { success: false, data: [], errors: [`Ошибка: ${error}`], warnings: [] };
  }
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Файл слишком большой (максимум 10MB)' };
  }
  
  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  const hasValidExtension = allowedExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return { valid: false, error: 'Используйте CSV, XLS или XLSX файлы' };
  }
  
  return { valid: true };
};

export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Не удалось прочитать файл'));
      }
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file, 'UTF-8');
  });
};
