import { useState, useCallback } from 'react';

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: ValidationErrors;
  isValid: boolean;
  hasErrors: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (newValues: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  validate: (field?: keyof T) => boolean;
  validateAll: () => boolean;
  reset: (newValues?: T) => void;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const validateField = (value: any, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'Это поле обязательно для заполнения';
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Минимальная длина: ${rules.minLength} символов`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Максимальная длина: ${rules.maxLength} символов`;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Неверный формат';
    }
  }

  // Number validations
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
    const numValue = typeof value === 'number' ? value : Number(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      return `Минимальное значение: ${rules.min}`;
    }
    
    if (rules.max !== undefined && numValue > rules.max) {
      return `Максимальное значение: ${rules.max}`;
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema = {}
): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<ValidationErrors>({});

  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Clear error when value changes
    if (errors[field as string]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [field as string]: error }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const validate = useCallback((field?: keyof T): boolean => {
    if (field) {
      // Validate single field
      const rules = validationSchema[field as string];
      if (!rules) return true;

      const error = validateField(values[field], rules);
      if (error) {
        setError(field, error);
        return false;
      } else {
        clearError(field);
        return true;
      }
    }

    return validateAll();
  }, [values, validationSchema, setError, clearError]);

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isFormValid = true;

    Object.keys(validationSchema).forEach(field => {
      const rules = validationSchema[field];
      const error = validateField(values[field as keyof T], rules);
      
      if (error) {
        newErrors[field] = error;
        isFormValid = false;
      }
    });

    setErrorsState(newErrors);
    return isFormValid;
  }, [values, validationSchema]);

  const reset = useCallback((newValues?: T) => {
    setValuesState(newValues || initialValues);
    setErrorsState({});
  }, [initialValues]);

  const handleChange = useCallback((field: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = e.target;
      let value: any = target.value;

      // Handle different input types
      if (target.type === 'checkbox') {
        value = (target as HTMLInputElement).checked;
      } else if (target.type === 'number') {
        value = target.value === '' ? '' : Number(target.value);
      }

      setValue(field, value);
    };
  }, [setValue]);

  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    values,
    errors,
    isValid,
    hasErrors,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    validate,
    validateAll,
    reset,
    handleChange,
  };
}

// Предопределенные правила валидации
export const ValidationRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Введите корректный email адрес';
      }
      return null;
    }
  },
  positiveNumber: { 
    required: true, 
    min: 0.01,
    custom: (value: any) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num) || num <= 0) {
        return 'Значение должно быть положительным числом';
      }
      return null;
    }
  },
  currency: {
    required: true,
    min: 0.01,
    max: 10000000,
    custom: (value: any) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) {
        return 'Введите корректную сумму';
      }
      if (num <= 0) {
        return 'Сумма должна быть больше 0';
      }
      if (num > 10000000) {
        return 'Сумма не может превышать 10,000,000';
      }
      return null;
    }
  },
  percentage: {
    min: 0,
    max: 100,
    custom: (value: any) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) {
        return 'Введите корректный процент';
      }
      if (num < 0 || num > 100) {
        return 'Процент должен быть от 0 до 100';
      }
      return null;
    }
  },
  categoryName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => {
      if (value && value.trim().length < 2) {
        return 'Название должно содержать минимум 2 символа';
      }
      return null;
    }
  },
  description: {
    required: true,
    minLength: 1,
    maxLength: 200
  },
  futureDate: {
    required: true,
    custom: (value: string) => {
      if (!value) return 'Выберите дату';
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date <= today) {
        return 'Дата должна быть в будущем';
      }
      return null;
    }
  }
};
