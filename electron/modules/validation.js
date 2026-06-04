/**
 * Модуль валидации данных для IPC обработчиков.
 * Обеспечивает проверку и санитизацию входных данных перед записью в БД.
 */

// Допустимые типы сущностей
const VALID_ENTITY_TYPES = [
  "budget",
  "category",
  "goal",
  "recurringPayment",
  "transaction",
];

// Максимальная длина строковых полей
const MAX_STRING_LENGTH = 500;
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

/**
 * Проверка, является ли тип сущности допустимым
 * @param {string} entityType
 * @returns {boolean}
 */
const isValidEntityType = (entityType) => {
  return VALID_ENTITY_TYPES.includes(entityType);
};

/**
 * Валидация ID (UUID или строка)
 * @param {string} id
 * @returns {boolean}
 */
const validateId = (id) => {
  if (typeof id !== "string" || id.length === 0) {
    return false;
  }
  // UUID v4 формат или простая строка
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return true;
  }
  // Альтернатива: строка длиной от 1 до 100 символов (для createEntityId)
  return id.length <= 100;
};

/**
 * Санитизация строки: удаление лишних пробелов, обрезка длины
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
const sanitizeString = (value, maxLength = MAX_STRING_LENGTH) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, maxLength);
};

/**
 * Валидация числа: проверка, что это число и оно в допустимом диапазоне
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @returns {{ isValid: boolean, value: number | null, error: string | null }}
 */
const validateNumber = (value, min = -Infinity, max = Infinity) => {
  const num = Number(value);
  if (isNaN(num)) {
    return {
      isValid: false,
      value: null,
      error: "Значение должно быть числом",
    };
  }
  if (num < min || num > max) {
    return {
      isValid: false,
      value: null,
      error: `Значение должно быть в диапазоне от ${min} до ${max}`,
    };
  }
  return { isValid: true, value: num, error: null };
};

/**
 * Валидация массива тегов
 * @param {*} tags
 * @returns {{ isValid: boolean, sanitized: string[], errors: string[] }}
 */
const validateTags = (tags) => {
  const errors = [];
  let sanitized = [];

  if (tags === undefined || tags === null) {
    return { isValid: true, sanitized: [], errors: [] };
  }

  if (!Array.isArray(tags)) {
    return {
      isValid: false,
      sanitized: [],
      errors: ["Теги должны быть массивом"],
    };
  }

  if (tags.length > MAX_TAGS) {
    errors.push(`Максимум ${MAX_TAGS} тегов`);
    tags = tags.slice(0, MAX_TAGS);
  }

  sanitized = tags
    .map((tag) => sanitizeString(String(tag), MAX_TAG_LENGTH))
    .filter((tag) => tag.length > 0);

  return { isValid: errors.length === 0, sanitized, errors };
};

/**
 * Валидация даты
 * @param {*} date
 * @returns {{ isValid: boolean, value: string | null, error: string | null }}
 */
const validateDate = (date) => {
  if (typeof date !== "string" || date.length === 0) {
    return { isValid: false, value: null, error: "Дата должна быть строкой" };
  }

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return { isValid: false, value: null, error: "Некорректный формат даты" };
  }

  return { isValid: true, value: date, error: null };
};

/**
 * Валидация payload для транзакции
 * @param {object} payload
 * @returns {{ isValid: boolean, sanitized: object, errors: string[] }}
 */
const validateTransaction = (payload) => {
  const errors = [];
  const sanitized = {};

  // amount (обязательное)
  if (payload.amount === undefined || payload.amount === null) {
    errors.push("Сумма обязательна");
  } else {
    const amountValidation = validateNumber(
      payload.amount,
      -999999999,
      999999999,
    );
    if (!amountValidation.isValid) {
      errors.push(`Сумма: ${amountValidation.error}`);
    } else {
      sanitized.amount = amountValidation.value;
    }
  }

  // type (обязательное)
  if (payload.type !== "income" && payload.type !== "expense") {
    errors.push('Тип должен быть "income" или "expense"');
  } else {
    sanitized.type = payload.type;
  }

  // category (обязательное)
  if (!payload.category || typeof payload.category !== "string") {
    errors.push("Категория обязательна");
  } else {
    sanitized.category = sanitizeString(payload.category, MAX_NAME_LENGTH);
  }

  // description (опциональное)
  sanitized.description = payload.description
    ? sanitizeString(payload.description, MAX_DESCRIPTION_LENGTH)
    : "";

  // date (обязательное)
  if (!payload.date) {
    errors.push("Дата обязательна");
  } else {
    const dateValidation = validateDate(payload.date);
    if (!dateValidation.isValid) {
      errors.push(`Дата: ${dateValidation.error}`);
    } else {
      sanitized.date = dateValidation.value;
    }
  }

  // tags (опциональное)
  const tagsValidation = validateTags(payload.tags);
  if (!tagsValidation.isValid) {
    errors.push(...tagsValidation.errors);
  }
  sanitized.tags = tagsValidation.sanitized;

  return { isValid: errors.length === 0, sanitized, errors };
};

/**
 * Валидация payload для категории
 * @param {object} payload
 * @returns {{ isValid: boolean, sanitized: object, errors: string[] }}
 */
const validateCategory = (payload) => {
  const errors = [];
  const sanitized = {};

  // name (обязательное)
  if (!payload.name || typeof payload.name !== "string") {
    errors.push("Название категории обязательно");
  } else {
    sanitized.name = sanitizeString(payload.name, MAX_NAME_LENGTH);
    if (sanitized.name.length === 0) {
      errors.push("Название категории не может быть пустым");
    }
  }

  // color (опциональное)
  sanitized.color =
    payload.color && typeof payload.color === "string"
      ? sanitizeString(payload.color, 50)
      : "#6B7280";

  // icon (опциональное)
  sanitized.icon =
    payload.icon && typeof payload.icon === "string"
      ? sanitizeString(payload.icon, 100)
      : "";

  // type (опциональное)
  if (payload.type && !["income", "expense", "both"].includes(payload.type)) {
    errors.push('Тип категории должен быть "income", "expense" или "both"');
  } else {
    sanitized.type = payload.type || "expense";
  }

  return { isValid: errors.length === 0, sanitized, errors };
};

/**
 * Валидация payload для бюджета
 * @param {object} payload
 * @returns {{ isValid: boolean, sanitized: object, errors: string[] }}
 */
const validateBudget = (payload) => {
  const errors = [];
  const sanitized = {};

  // category (обязательное)
  if (!payload.category || typeof payload.category !== "string") {
    errors.push("Категория обязательна");
  } else {
    sanitized.category = sanitizeString(payload.category, MAX_NAME_LENGTH);
  }

  // limit (обязательное)
  if (payload.limit === undefined || payload.limit === null) {
    errors.push("Лимит обязателен");
  } else {
    const limitValidation = validateNumber(payload.limit, 0, 999999999);
    if (!limitValidation.isValid) {
      errors.push(`Лимит: ${limitValidation.error}`);
    } else {
      sanitized.limit = limitValidation.value;
    }
  }

  // spent (опциональное)
  if (payload.spent !== undefined && payload.spent !== null) {
    const spentValidation = validateNumber(payload.spent, 0, 999999999);
    if (!spentValidation.isValid) {
      errors.push(`Потрачено: ${spentValidation.error}`);
    } else {
      sanitized.spent = spentValidation.value;
    }
  } else {
    sanitized.spent = 0;
  }

  // period (опциональное)
  sanitized.period =
    payload.period && typeof payload.period === "string"
      ? sanitizeString(payload.period, 50)
      : "monthly";

  return { isValid: errors.length === 0, sanitized, errors };
};

/**
 * Валидация payload для финансовой цели
 * @param {object} payload
 * @returns {{ isValid: boolean, sanitized: object, errors: string[] }}
 */
const validateGoal = (payload) => {
  const errors = [];
  const sanitized = {};

  // name (обязательное)
  if (!payload.name || typeof payload.name !== "string") {
    errors.push("Название цели обязательно");
  } else {
    sanitized.name = sanitizeString(payload.name, MAX_NAME_LENGTH);
    if (sanitized.name.length === 0) {
      errors.push("Название цели не может быть пустым");
    }
  }

  // target (обязательное)
  if (payload.target === undefined || payload.target === null) {
    errors.push("Целевая сумма обязательна");
  } else {
    const targetValidation = validateNumber(payload.target, 0, 999999999);
    if (!targetValidation.isValid) {
      errors.push(`Целевая сумма: ${targetValidation.error}`);
    } else {
      sanitized.target = targetValidation.value;
    }
  }

  // current (опциональное)
  if (payload.current !== undefined && payload.current !== null) {
    const currentValidation = validateNumber(payload.current, 0, 999999999);
    if (!currentValidation.isValid) {
      errors.push(`Текущая сумма: ${currentValidation.error}`);
    } else {
      sanitized.current = currentValidation.value;
    }
  } else {
    sanitized.current = 0;
  }

  // deadline (опциональное)
  if (payload.deadline) {
    const dateValidation = validateDate(payload.deadline);
    if (!dateValidation.isValid) {
      errors.push(`Дедлайн: ${dateValidation.error}`);
    } else {
      sanitized.deadline = dateValidation.value;
    }
  }

  return { isValid: errors.length === 0, sanitized, errors };
};

/**
 * Валидация payload для регулярного платежа
 * @param {object} payload
 * @returns {{ isValid: boolean, sanitized: object, errors: string[] }}
 */
const validateRecurringPayment = (payload) => {
  const errors = [];
  const sanitized = {};

  // name (обязательное)
  if (!payload.name || typeof payload.name !== "string") {
    errors.push("Название платежа обязательно");
  } else {
    sanitized.name = sanitizeString(payload.name, MAX_NAME_LENGTH);
    if (sanitized.name.length === 0) {
      errors.push("Название платежа не может быть пустым");
    }
  }

  // amount (обязательное)
  if (payload.amount === undefined || payload.amount === null) {
    errors.push("Сумма обязательна");
  } else {
    const amountValidation = validateNumber(payload.amount, 0, 999999999);
    if (!amountValidation.isValid) {
      errors.push(`Сумма: ${amountValidation.error}`);
    } else {
      sanitized.amount = amountValidation.value;
    }
  }

  // category (обязательное)
  if (!payload.category || typeof payload.category !== "string") {
    errors.push("Категория обязательна");
  } else {
    sanitized.category = sanitizeString(payload.category, MAX_NAME_LENGTH);
  }

  // type (обязательное)
  if (payload.type !== "income" && payload.type !== "expense") {
    errors.push('Тип должен быть "income" или "expense"');
  } else {
    sanitized.type = payload.type;
  }

  // frequency (обязательное)
  const validFrequencies = [
    "daily",
    "weekly",
    "biweekly",
    "monthly",
    "quarterly",
    "yearly",
  ];
  if (!payload.frequency || !validFrequencies.includes(payload.frequency)) {
    errors.push(`Частота должна быть одной из: ${validFrequencies.join(", ")}`);
  } else {
    sanitized.frequency = payload.frequency;
  }

  // nextDate (опциональное)
  if (payload.nextDate) {
    const dateValidation = validateDate(payload.nextDate);
    if (!dateValidation.isValid) {
      errors.push(`Дата следующего платежа: ${dateValidation.error}`);
    } else {
      sanitized.nextDate = dateValidation.value;
    }
  }

  // description (опциональное)
  sanitized.description = payload.description
    ? sanitizeString(payload.description, MAX_DESCRIPTION_LENGTH)
    : "";

  return { isValid: errors.length === 0, sanitized, errors };
};

/**
 * Валидация payload в зависимости от типа сущности
 * @param {string} entityType
 * @param {object} payload
 * @returns {{ isValid: boolean, sanitized: object, errors: string[] }}
 */
const validateEntityPayload = (entityType, payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      isValid: false,
      sanitized: {},
      errors: ["Payload должен быть объектом"],
    };
  }

  switch (entityType) {
    case "transaction":
      return validateTransaction(payload);
    case "category":
      return validateCategory(payload);
    case "budget":
      return validateBudget(payload);
    case "goal":
      return validateGoal(payload);
    case "recurringPayment":
      return validateRecurringPayment(payload);
    default:
      return {
        isValid: false,
        sanitized: {},
        errors: [`Неизвестный тип сущности: ${entityType}`],
      };
  }
};

/**
 * Валидация обновлений (частичных) для сущности
 * @param {string} entityType
 * @param {object} updates
 * @returns {{ isValid: boolean, sanitized: object, errors: string[] }}
 */
const validateUpdates = (entityType, updates) => {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return {
      isValid: false,
      sanitized: {},
      errors: ["Updates должен быть объектом"],
    };
  }

  if (Object.keys(updates).length === 0) {
    return {
      isValid: false,
      sanitized: {},
      errors: ["Нет полей для обновления"],
    };
  }

  // Для обновлений используем те же валидаторы, но разрешаем частичные данные
  const fullValidation = validateEntityPayload(entityType, {
    // Заполняем заглушками обязательные поля, которые не переданы
    ...getDefaultPayload(entityType),
    ...updates,
  });

  // Фильтруем ошибки: оставляем только те, что относятся к переданным полям
  const updateKeys = Object.keys(updates);
  const relevantErrors = fullValidation.errors.filter((error) => {
    return updateKeys.some((key) =>
      error.toLowerCase().includes(key.toLowerCase()),
    );
  });

  // Фильтруем sanitized: оставляем только переданные поля
  const sanitizedUpdates = {};
  for (const key of updateKeys) {
    if (key in fullValidation.sanitized) {
      sanitizedUpdates[key] = fullValidation.sanitized[key];
    }
  }

  return {
    isValid: relevantErrors.length === 0,
    sanitized: sanitizedUpdates,
    errors: relevantErrors,
  };
};

/**
 * Получение дефолтного payload для типа сущности (для частичной валидации)
 * @param {string} entityType
 * @returns {object}
 */
const getDefaultPayload = (entityType) => {
  switch (entityType) {
    case "transaction":
      return {
        amount: 0,
        type: "expense",
        category: "default",
        date: new Date().toISOString(),
      };
    case "category":
      return { name: "default" };
    case "budget":
      return { category: "default", limit: 0 };
    case "goal":
      return { name: "default", target: 0 };
    case "recurringPayment":
      return {
        name: "default",
        amount: 0,
        category: "default",
        type: "expense",
        frequency: "monthly",
      };
    default:
      return {};
  }
};

export {
  isValidEntityType,
  validateId,
  validateEntityPayload,
  validateUpdates,
};
