import { Transaction, Category } from '../types';

export interface ImportResult<T = Omit<Transaction, 'id'> | Omit<Category, 'id'>> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
}

const parseCSV = (csvText: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index++) {
    const char = csvText[index];

    if (char === '"') {
      if (inQuotes && csvText[index + 1] === '"') {
        current += '"';
        index++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[index + 1] === '\n') {
        index++;
      }
      row.push(current.trim());
      if (row.some(value => value.length > 0)) {
        result.push(row);
      }
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (inQuotes) {
    throw new Error('Незакрытая кавычка в CSV-файле');
  }

  row.push(current.trim());
  if (row.some(value => value.length > 0)) {
    result.push(row);
  }

  return result;
};

export const importTransactions = (csvText: string): ImportResult<Omit<Transaction, 'id'>> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const transactions: Omit<Transaction, 'id'>[] = [];
  
  try {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: false, data: [], errors: ['Файл пуст'], warnings: [] };
    }
    
    const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').toLowerCase().trim());
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
          type,
          amount,
          category,
          description,
          date: date.toISOString().split('T')[0],
          tags: tags.length > 0 ? tags : undefined
        });
        
      } catch {
        errors.push(`Строка ${rowNumber}: ошибка обработки`);
      }
    });
    
    return { success: errors.length === 0, data: transactions, errors, warnings };
    
  } catch (e) {
    return { success: false, data: [], errors: [`Ошибка парсинга: ${e}`], warnings: [] };
  }
};

export const importCategories = (csvText: string): ImportResult<Omit<Category, 'id'>> => {
  const errors: string[] = [];
  const categories: Omit<Category, 'id'>[] = [];
  
  try {
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return { success: false, data: [], errors: ['Файл пуст'], warnings: [] };
    }
    
    const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').toLowerCase().trim());
    const dataRows = rows.slice(1);
    
    const getColumnIndex = (searchTerms: string[]) => 
      headers.findIndex(h => searchTerms.some(term => h.includes(term)));
    
    const nameIndex = getColumnIndex(['название', 'name']);
    const typeIndex = getColumnIndex(['тип', 'type']);
    const colorIndex = getColumnIndex(['цвет', 'color']);

    const missingColumns = [
      ['название', 'name'],
      ['тип', 'type'],
    ].filter(searchTerms => getColumnIndex(searchTerms) < 0);

    if (missingColumns.length > 0) {
      return {
        success: false,
        data: [],
        errors: ['Отсутствуют обязательные колонки: Название, Тип'],
        warnings: [],
      };
    }
    
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
          name,
          type,
          color
        });
        
      } catch {
        errors.push(`Строка ${rowNumber}: ошибка обработки`);
      }
    });
    
    return { success: errors.length === 0, data: categories, errors, warnings: [] };
    
  } catch (e) {
    return { success: false, data: [], errors: [`Ошибка: ${e}`], warnings: [] };
  }
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Файл слишком большой (максимум 10MB)' };
  }
  
  const allowedExtensions = ['.csv'];
  const hasValidExtension = allowedExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return { valid: false, error: 'Используйте CSV файлы' };
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
