/**
 * Tests for validation.js
 * Covers: isValidEntityType, validateId, validateEntityPayload, validateUpdates
 */
import { describe, it, expect } from 'vitest';
import {
  isValidEntityType,
  validateId,
  validateEntityPayload,
  validateUpdates,
} from '../../electron/modules/validation.js';

// =============================================================================
// isValidEntityType
// =============================================================================
describe('isValidEntityType', () => {
  it('должен вернуть true для всех 5 типов сущностей', () => {
    expect(isValidEntityType('transaction')).toBe(true);
    expect(isValidEntityType('category')).toBe(true);
    expect(isValidEntityType('budget')).toBe(true);
    expect(isValidEntityType('goal')).toBe(true);
    expect(isValidEntityType('recurringPayment')).toBe(true);
  });

  it('должен вернуть false для невалидного типа', () => {
    expect(isValidEntityType('user')).toBe(false);
    expect(isValidEntityType('')).toBe(false);
    expect(isValidEntityType(null)).toBe(false);
    expect(isValidEntityType(undefined)).toBe(false);
    expect(isValidEntityType(123)).toBe(false);
  });
});

// =============================================================================
// validateId
// =============================================================================
describe('validateId', () => {
  it('должен принять UUID v4', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(validateId(uuid)).toBe(true);
  });

  it('должен принять короткую строку (до 100 символов)', () => {
    expect(validateId('simple-id')).toBe(true);
    expect(validateId('a')).toBe(true);
    expect(validateId('12345')).toBe(true);
  });

  it('должен отклонить пустую строку', () => {
    expect(validateId('')).toBe(false);
  });

  it('должен отклонить не-строковые значения', () => {
    expect(validateId(null)).toBe(false);
    expect(validateId(undefined)).toBe(false);
    expect(validateId(123)).toBe(false);
    expect(validateId({})).toBe(false);
  });

  it('должен отклонить строку длиннее 100 символов', () => {
    const longString = 'a'.repeat(101);
    expect(validateId(longString)).toBe(false);
  });
});

// =============================================================================
// validateEntityPayload — Transaction
// =============================================================================
describe('validateEntityPayload — transaction', () => {
  const validTransaction = {
    amount: 1000,
    type: 'expense',
    category: 'Продукты',
    description: 'Покупка продуктов',
    date: '2024-01-15',
    tags: ['еда', 'супермаркет'],
  };

  it('должен принять валидную транзакцию', () => {
    const result = validateEntityPayload('transaction', validTransaction);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitized.amount).toBe(1000);
    expect(result.sanitized.type).toBe('expense');
    expect(result.sanitized.category).toBe('Продукты');
  });

  it('должен сохранить валидный id для записи в SQLite', () => {
    const result = validateEntityPayload('transaction', {
      ...validTransaction,
      id: 'transaction-1',
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.id).toBe('transaction-1');
  });

  it('должен отклонить транзакцию без amount', () => {
    const { amount, ...noAmount } = validTransaction;
    const result = validateEntityPayload('transaction', noAmount);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Сумма обязательна');
  });

  it('должен отклонить транзакцию с невалидным type', () => {
    const result = validateEntityPayload('transaction', {
      ...validTransaction,
      type: 'invalid',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Тип должен быть "income" или "expense"');
  });

  it('должен отклонить транзакцию без category', () => {
    const { category, ...noCategory } = validTransaction;
    const result = validateEntityPayload('transaction', noCategory);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Категория обязательна');
  });

  it('должен отклонить транзакцию без date', () => {
    const { date, ...noDate } = validTransaction;
    const result = validateEntityPayload('transaction', noDate);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Дата обязательна');
  });

  it('должен принять транзакцию без description и tags', () => {
    const { description, tags, ...minimal } = validTransaction;
    const result = validateEntityPayload('transaction', minimal);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.description).toBe('');
    expect(result.sanitized.tags).toEqual([]);
  });

  it('должен санитизировать длинное описание', () => {
    const longDesc = 'a'.repeat(2000);
    const result = validateEntityPayload('transaction', {
      ...validTransaction,
      description: longDesc,
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.description.length).toBeLessThanOrEqual(1000);
  });

  it('должен отклонить транзакцию с суммой за пределами диапазона', () => {
    const result = validateEntityPayload('transaction', {
      ...validTransaction,
      amount: -1000000000,
    });
    expect(result.isValid).toBe(false);
  });

  it('должен принять транзакцию с доходом', () => {
    const result = validateEntityPayload('transaction', {
      ...validTransaction,
      type: 'income',
      amount: 50000,
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.type).toBe('income');
  });
});

// =============================================================================
// validateEntityPayload — Category
// =============================================================================
describe('validateEntityPayload — category', () => {
  const validCategory = {
    name: 'Продукты',
    color: '#ef4444',
    type: 'expense',
  };

  it('должен принять валидную категорию', () => {
    const result = validateEntityPayload('category', validCategory);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.name).toBe('Продукты');
    expect(result.sanitized.color).toBe('#ef4444');
  });

  it('должен отклонить категорию без name', () => {
    const { name, ...noName } = validCategory;
    const result = validateEntityPayload('category', noName);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Название категории обязательно');
  });

  it('должен отклонить категорию с пустым name', () => {
    const result = validateEntityPayload('category', {
      ...validCategory,
      name: '   ',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Название категории не может быть пустым');
  });

  it('должен установить цвет по умолчанию, если не указан', () => {
    const { color, ...noColor } = validCategory;
    const result = validateEntityPayload('category', noColor);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.color).toBe('#6B7280');
  });

  it('должен отклонить невалидный type категории', () => {
    const result = validateEntityPayload('category', {
      ...validCategory,
      type: 'invalid',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Тип категории должен быть "income" или "expense"');
  });

  it('должен отклонить устаревший type = both', () => {
    const result = validateEntityPayload('category', {
      ...validCategory,
      type: 'both',
    });
    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// validateEntityPayload — Budget
// =============================================================================
describe('validateEntityPayload — budget', () => {
  const validBudget = {
    categoryId: 'category-food',
    amount: 30000,
    period: 'monthly',
  };

  it('должен принять валидный бюджет', () => {
    const result = validateEntityPayload('budget', validBudget);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.categoryId).toBe('category-food');
    expect(result.sanitized.amount).toBe(30000);
    expect(result.sanitized.period).toBe('monthly');
  });

  it('должен отклонить бюджет без categoryId', () => {
    const { categoryId, ...noCategory } = validBudget;
    const result = validateEntityPayload('budget', noCategory);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('ID категории обязателен');
  });

  it('должен отклонить бюджет без amount', () => {
    const { amount, ...noAmount } = validBudget;
    const result = validateEntityPayload('budget', noAmount);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Сумма бюджета обязательна');
  });

  it('должен установить spent = 0, если не указан', () => {
    const result = validateEntityPayload('budget', validBudget);
    expect(result.sanitized.spent).toBe(0);
  });

  it('должен отклонить бюджет с отрицательным лимитом', () => {
    const result = validateEntityPayload('budget', {
      ...validBudget,
      amount: -100,
    });
    expect(result.isValid).toBe(false);
  });
});

// =============================================================================
// validateEntityPayload — Goal
// =============================================================================
describe('validateEntityPayload — goal', () => {
  const validGoal = {
    name: 'Накопить на машину',
    targetAmount: 1000000,
    deadline: '2025-12-31',
  };

  it('должен принять валидную цель', () => {
    const result = validateEntityPayload('goal', validGoal);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.name).toBe('Накопить на машину');
    expect(result.sanitized.targetAmount).toBe(1000000);
  });

  it('должен отклонить цель без name', () => {
    const { name, ...noName } = validGoal;
    const result = validateEntityPayload('goal', noName);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Название цели обязательно');
  });

  it('должен отклонить цель без targetAmount', () => {
    const { targetAmount, ...noTarget } = validGoal;
    const result = validateEntityPayload('goal', noTarget);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Целевая сумма обязательна');
  });

  it('должен установить currentAmount = 0, если не указан', () => {
    const result = validateEntityPayload('goal', validGoal);
    expect(result.sanitized.currentAmount).toBe(0);
  });

  it('должен отклонить цель без deadline', () => {
    const { deadline, ...noDeadline } = validGoal;
    const result = validateEntityPayload('goal', noDeadline);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Дедлайн обязателен');
  });
});

// =============================================================================
// validateEntityPayload — RecurringPayment
// =============================================================================
describe('validateEntityPayload — recurringPayment', () => {
  const validPayment = {
    name: 'Аренда квартиры',
    amount: 30000,
    category: 'Жильё',
    frequency: 'monthly',
    nextDate: '2025-01-01',
    isActive: true,
  };

  it('должен принять валидный регулярный платёж', () => {
    const result = validateEntityPayload('recurringPayment', validPayment);
    expect(result.isValid).toBe(true);
    expect(result.sanitized.name).toBe('Аренда квартиры');
    expect(result.sanitized.amount).toBe(30000);
    expect(result.sanitized.frequency).toBe('monthly');
  });

  it('должен отклонить платёж без name', () => {
    const { name, ...noName } = validPayment;
    const result = validateEntityPayload('recurringPayment', noName);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Название платежа обязательно');
  });

  it('должен отклонить платёж без amount', () => {
    const { amount, ...noAmount } = validPayment;
    const result = validateEntityPayload('recurringPayment', noAmount);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Сумма обязательна');
  });

  it('должен отклонить платёж без category', () => {
    const { category, ...noCategory } = validPayment;
    const result = validateEntityPayload('recurringPayment', noCategory);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Категория обязательна');
  });

  it('должен отклонить платёж с невалидной частотой', () => {
    const result = validateEntityPayload('recurringPayment', {
      ...validPayment,
      frequency: 'annually',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Частота'))).toBe(true);
  });

  it('должен принять все валидные частоты', () => {
    const frequencies = ['daily', 'weekly', 'monthly', 'yearly'];
    frequencies.forEach((freq) => {
      const result = validateEntityPayload('recurringPayment', {
        ...validPayment,
        frequency: freq,
      });
      expect(result.isValid).toBe(true);
    });
  });

  it('должен принять custom frequency только с cronExpression', () => {
    const result = validateEntityPayload('recurringPayment', {
      ...validPayment,
      frequency: 'custom',
      cronExpression: '0 9 * * *',
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.frequency).toBe('custom');
    expect(result.sanitized.cronExpression).toBe('0 9 * * *');
  });

  it('должен отклонить custom frequency без cronExpression', () => {
    const result = validateEntityPayload('recurringPayment', {
      ...validPayment,
      frequency: 'custom',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Cron-выражение обязательно для настраиваемой частоты');
  });
});

// =============================================================================
// validateEntityPayload — unknown type
// =============================================================================
describe('validateEntityPayload — unknown type', () => {
  it('должен вернуть ошибку для неизвестного типа', () => {
    const result = validateEntityPayload('unknown', {});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Неизвестный тип сущности: unknown');
  });
});

// =============================================================================
// validateUpdates
// =============================================================================
describe('validateUpdates', () => {
  it('должен принять частичные обновления для транзакции', () => {
    const result = validateUpdates('transaction', { amount: 5000 });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.amount).toBe(5000);
  });

  it('должен принять частичные обновления для категории', () => {
    const result = validateUpdates('category', { color: '#ff0000' });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.color).toBe('#ff0000');
  });

  it('должен отклонить пустой объект обновлений', () => {
    const result = validateUpdates('transaction', {});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Нет полей для обновления');
  });

  it('должен отклонить не-объект', () => {
    expect(validateUpdates('transaction', null).isValid).toBe(false);
    expect(validateUpdates('transaction', 'string').isValid).toBe(false);
    expect(validateUpdates('transaction', 123).isValid).toBe(false);
    expect(validateUpdates('transaction', []).isValid).toBe(false);
  });

  it('должен вернуть только переданные поля в sanitized', () => {
    const result = validateUpdates('transaction', { description: 'Новое описание' });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.sanitized)).toEqual(['description']);
    expect(result.sanitized.description).toBe('Новое описание');
  });

  // Примечание: validateUpdates не гарантирует отклонение невалидных значений
  // в частичных обновлениях, так как использует getDefaultPayload для заполнения
  // недостающих полей, и фильтрация ошибок идёт по вхождению ключа в текст ошибки.
  // Полная валидация выполняется только в validateEntityPayload.
});

// =============================================================================
// Санитизация строк
// =============================================================================
describe('Санитизация строк', () => {
  it('должен обрезать пробелы в названии категории', () => {
    const result = validateEntityPayload('category', {
      name: '  Продукты  ',
    });
    expect(result.sanitized.name).toBe('Продукты');
  });

  it('должен обрезать длинные строки', () => {
    const longName = 'a'.repeat(500);
    const result = validateEntityPayload('category', {
      name: longName,
    });
    expect(result.sanitized.name.length).toBeLessThanOrEqual(200);
  });

  it('должен санитизировать теги', () => {
    const result = validateEntityPayload('transaction', {
      amount: 100,
      type: 'expense',
      category: 'Test',
      date: '2024-01-01',
      tags: ['  tag1  ', 'tag2', ''],
    });
    expect(result.isValid).toBe(true);
    expect(result.sanitized.tags).toEqual(['tag1', 'tag2']);
  });

  it('должен ограничить количество тегов до 20', () => {
    const manyTags = Array.from({ length: 30 }, (_, i) => `tag${i}`);
    const result = validateEntityPayload('transaction', {
      amount: 100,
      type: 'expense',
      category: 'Test',
      date: '2024-01-01',
      tags: manyTags,
    });
    expect(result.sanitized.tags.length).toBeLessThanOrEqual(20);
  });
});
