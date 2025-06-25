import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function DatePicker({
  label,
  value,
  onChange,
  error,
  fullWidth = false,
  placeholder = 'Выберите дату',
  required = false,
  disabled = false,
  minDate,
  maxDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [showYearSelect, setShowYearSelect] = useState(false);
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Закрытие календаря при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowYearSelect(false);
        setShowMonthSelect(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Блокируем скролл body при открытом календаре
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Обновление выбранной даты при изменении value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Проверка ограничений
    if (minDate && dateString < minDate) return;
    if (maxDate && dateString > maxDate) return;
    
    setSelectedDate(date);
    onChange(dateString);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    handleDateSelect(today);
  };

  const handleYearChange = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setShowYearSelect(false);
  };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
    setShowMonthSelect(false);
  };

  const generateYearRange = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 50;
    const endYear = currentYear + 10;
    const years = [];
    
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    
    return years;
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем день недели первого дня месяца (0 = воскресенье, 1 = понедельник, ...)
    // Преобразуем в европейский формат (0 = понедельник, 6 = воскресенье)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    
    const days: (Date | null)[] = [];
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth();
  const years = generateYearRange();

  return (
    <div className={fullWidth ? 'w-full' : ''} ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={inputRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-sm rounded-2xl border transition-all duration-200 
            focus:outline-none focus:ring-4 focus:ring-offset-1 text-left
            flex items-center justify-between gap-3
            ${disabled 
              ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' 
              : 'cursor-pointer hover:shadow-md'
            }
            ${error 
              ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' 
              : 'border-slate-200 focus:ring-blue-500/30 focus:border-blue-500 dark:border-slate-700'
            }
            ${fullWidth ? 'w-full' : ''}
            bg-white dark:bg-slate-800 dark:text-slate-100 shadow-sm
          `}
        >
          <span className={selectedDate ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          <Calendar size={16} className="text-slate-400" />
        </button>

        {/* Центрированный календарь с overlay */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]" />
            
            {/* Календарь */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl shadow-slate-900/25 p-6 w-full max-w-sm mx-auto transform transition-all duration-300 scale-100 opacity-100">
                {/* Заголовок с навигацией */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-110"
                  >
                    <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                  </button>
                  
                  <div className="text-center flex flex-col gap-1">
                    {/* Кликабельный месяц */}
                    <button
                      onClick={() => {
                        setShowMonthSelect(!showMonthSelect);
                        setShowYearSelect(false);
                      }}
                      className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      {MONTHS[currentMonth.getMonth()]}
                    </button>
                    
                    {/* Кликабельный год */}
                    <button
                      onClick={() => {
                        setShowYearSelect(!showYearSelect);
                        setShowMonthSelect(false);
                      }}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      {currentMonth.getFullYear()}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-110"
                  >
                    <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                {/* Выбор месяца */}
                {showMonthSelect && (
                  <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                    <div className="grid grid-cols-3 gap-2">
                      {MONTHS.map((month, index) => (
                        <button
                          key={month}
                          onClick={() => handleMonthChange(index)}
                          className={`
                            px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
                            ${currentMonth.getMonth() === index
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                            }
                          `}
                        >
                          {month.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Выбор года */}
                {showYearSelect && (
                  <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearChange(year)}
                          className={`
                            px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
                            ${currentMonth.getFullYear() === year
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                            }
                          `}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Дни недели */}
                {!showMonthSelect && !showYearSelect && (
                  <>
                    <div className="grid grid-cols-7 gap-1 mb-3">
                      {WEEKDAYS.map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-3">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Календарная сетка */}
                    <div className="grid grid-cols-7 gap-1 mb-6">
                      {days.map((date, index) => (
                        <div key={index} className="aspect-square">
                          {date && (
                            <button
                              onClick={() => handleDateSelect(date)}
                              disabled={isDateDisabled(date)}
                              className={`
                                w-full h-full rounded-2xl text-sm font-semibold transition-all duration-200
                                flex items-center justify-center relative overflow-hidden
                                ${isSelected(date)
                                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-110'
                                  : isToday(date)
                                  ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-900 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-100 ring-2 ring-blue-500/30'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                                }
                                ${isDateDisabled(date)
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'cursor-pointer hover:scale-110 active:scale-95'
                                }
                              `}
                            >
                              {date.getDate()}
                              {isToday(date) && !isSelected(date) && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Быстрые действия */}
                <div className="flex gap-3">
                  <button
                    onClick={navigateToToday}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all duration-200 hover:scale-105"
                  >
                    Сегодня
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 hover:scale-105"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
