import React, { useState } from 'react';
import { Wand2, Calculator, Target, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Budget } from '../../types';

interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  percentages: {
    needs: number;
    wants: number;
    savings: number;
  };
  categories: {
    needs: string[];
    wants: string[];
    savings: string[];
  };
}

const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: '50-30-20',
    name: '50/30/20 Правило',
    description: 'Классическое правило: 50% потребности, 30% желания, 20% сбережения',
    icon: '📊',
    percentages: { needs: 50, wants: 30, savings: 20 },
    categories: {
      needs: ['Продукты', 'Коммунальные услуги', 'Транспорт', 'Здоровье'],
      wants: ['Развлечения', 'Рестораны', 'Шопинг', 'Хобби'],
      savings: ['Накопления', 'Инвестиции', 'Экстренный фонд']
    }
  },
  {
    id: '60-20-20',
    name: '60/20/20 Консервативный',
    description: 'Больше на потребности, меньше на желания',
    icon: '🛡️',
    percentages: { needs: 60, wants: 20, savings: 20 },
    categories: {
      needs: ['Продукты', 'Коммунальные услуги', 'Транспорт', 'Здоровье', 'Страхование'],
      wants: ['Развлечения', 'Рестораны'],
      savings: ['Накопления', 'Инвестиции']
    }
  },
  {
    id: '40-40-20',
    name: '40/40/20 Сбалансированный',
    description: 'Равновесие между потребностями и желаниями',
    icon: '⚖️',
    percentages: { needs: 40, wants: 40, savings: 20 },
    categories: {
      needs: ['Продукты', 'Коммунальные услуги', 'Транспорт'],
      wants: ['Развлечения', 'Рестораны', 'Шопинг', 'Путешествия'],
      savings: ['Накопления', 'Инвестиции']
    }
  },
  {
    id: 'custom',
    name: 'Настраиваемый',
    description: 'Создайте свои пропорции',
    icon: '🎛️',
    percentages: { needs: 50, wants: 30, savings: 20 },
    categories: {
      needs: [],
      wants: [],
      savings: []
    }
  }
];

interface BudgetWizardProps {
  onComplete: (budgets: Omit<Budget, 'id'>[]) => void;
  onClose: () => void;
}

export function BudgetWizard({ onComplete, onClose }: BudgetWizardProps) {
  const { state } = useApp();
  const [step, setStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplate>(BUDGET_TEMPLATES[0]);
  const [customPercentages, setCustomPercentages] = useState({
    needs: 50,
    wants: 30,
    savings: 20
  });
  const [categoryAssignments, setCategoryAssignments] = useState<{
    [categoryId: string]: 'needs' | 'wants' | 'savings'
  }>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateAmounts = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const percentages = selectedTemplate.id === 'custom' ? customPercentages : selectedTemplate.percentages;
    
    return {
      needs: (income * percentages.needs) / 100,
      wants: (income * percentages.wants) / 100,
      savings: (income * percentages.savings) / 100,
      total: income
    };
  };

  const getSmartRecommendations = () => {
    // Анализируем историю трат пользователя
    const lastMonthTransactions = state.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return transactionDate >= lastMonth && t.type === 'expense';
    });

    const categoryTotals = lastMonthTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

    // Рекомендуем доход на основе трат + 20% буфер
    const recommendedIncome = Math.ceil(totalSpent * 1.2 / 1000) * 1000;

    return {
      recommendedIncome,
      categoryTotals,
      totalSpent
    };
  };

  const handleTemplateSelect = (template: BudgetTemplate) => {
    setSelectedTemplate(template);
    if (template.id === 'custom') {
      setCustomPercentages({ needs: 50, wants: 30, savings: 20 });
    }
  };

  const handleCustomPercentageChange = (type: keyof typeof customPercentages, value: number) => {
    const newPercentages = { ...customPercentages, [type]: value };
    const total = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);
    
    if (total <= 100) {
      setCustomPercentages(newPercentages);
    }
  };

  const assignCategoryToGroup = (categoryId: string, group: 'needs' | 'wants' | 'savings') => {
    setCategoryAssignments(prev => ({
      ...prev,
      [categoryId]: group
    }));
  };

  const generateBudgets = () => {
    const amounts = calculateAmounts();
    const percentages = selectedTemplate.id === 'custom' ? customPercentages : selectedTemplate.percentages;
    
    // Группируем категории
    type BudgetGroup = NonNullable<Budget['group']>;
    const groupedCategories: Record<BudgetGroup, string[]> = {
      needs: [],
      wants: [],
      savings: []
    };

    state.categories.forEach(category => {
      if (category.type === 'expense') {
        const assignment = categoryAssignments[category.id];
        if (assignment) {
          groupedCategories[assignment].push(category.id);
        }
      }
    });

    // Создаём бюджеты для каждой категории
    const budgets: Omit<Budget, 'id'>[] = [];

    (Object.entries(groupedCategories) as [BudgetGroup, string[]][]).forEach(([group, categoryIds]) => {
      const groupAmount = amounts[group as keyof typeof amounts];
      const amountPerCategory = categoryIds.length > 0 ? groupAmount / categoryIds.length : 0;

      categoryIds.forEach(categoryId => {
        budgets.push({
          categoryId,
          amount: amountPerCategory,
          period: 'monthly' as const,
          spent: 0,
          remaining: amountPerCategory,
          group,
          percentage: percentages[group as keyof typeof percentages]
        });
      });
    });

    return budgets;
  };

  const handleComplete = () => {
    try {
      const budgets = generateBudgets();
      console.log('Generated budgets:', budgets);
      
      if (budgets.length === 0) {
        alert('Необходимо назначить хотя бы одну категорию для создания бюджета');
        return;
      }
      
      onComplete(budgets);
    } catch (error) {
      console.error('Error creating budgets:', error);
      alert('Ошибка при создании бюджета. Попробуйте еще раз.');
    }
  };

  const recommendations = getSmartRecommendations();
  const amounts = calculateAmounts();
  const totalPercentage = selectedTemplate.id === 'custom' 
    ? Object.values(customPercentages).reduce((sum, val) => sum + val, 0)
    : 100;

  const expenseCategories = state.categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6">
      {/* Прогресс */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Wand2 className="text-blue-600 dark:text-blue-400" size={20} />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Мастер настройки бюджета
          </h2>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Шаг {step} из 3
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(stepNumber => (
          <div
            key={stepNumber}
            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
              stepNumber <= step 
                ? 'bg-blue-600' 
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Шаг 1: Доход */}
      {step === 1 && (
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <Calculator className="mx-auto text-blue-600 dark:text-blue-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Укажите ваш месячный доход
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Это поможет рассчитать оптимальные лимиты для каждой категории
              </p>
            </div>

            {recommendations.totalSpent > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-blue-600 dark:text-blue-400" size={16} />
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Умная рекомендация
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  На основе ваших трат за прошлый месяц ({formatCurrency(recommendations.totalSpent)}) 
                  рекомендуем доход: <strong>{formatCurrency(recommendations.recommendedIncome)}</strong>
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMonthlyIncome(recommendations.recommendedIncome.toString())}
                >
                  Использовать рекомендацию
                </Button>
              </div>
            )}

            <div className="max-w-md mx-auto">
              <Input
                label="Месячный доход после налогов"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="100000"
                fullWidth
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!monthlyIncome || parseFloat(monthlyIncome) <= 0}
              >
                Далее <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Шаг 2: Выбор шаблона */}
      {step === 2 && (
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <Target className="mx-auto text-blue-600 dark:text-blue-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Выберите систему бюджетирования
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Мы рекомендуем начать с проверенных методов
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BUDGET_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedTemplate.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                      {template.name}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {template.description}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                      {template.percentages.needs}% потребности
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                      {template.percentages.wants}% желания
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                      {template.percentages.savings}% сбережения
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedTemplate.id === 'custom' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Настройте пропорции
                </h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Потребности (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customPercentages.needs}
                      onChange={(e) => handleCustomPercentageChange('needs', parseInt(e.target.value) || 0)}
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Желания (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customPercentages.wants}
                      onChange={(e) => handleCustomPercentageChange('wants', parseInt(e.target.value) || 0)}
                      fullWidth
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Сбережения (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={customPercentages.savings}
                      onChange={(e) => handleCustomPercentageChange('savings', parseInt(e.target.value) || 0)}
                      fullWidth
                    />
                  </div>
                </div>
                <div className={`text-sm ${
                  totalPercentage === 100 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Итого: {totalPercentage}% {totalPercentage !== 100 && '(должно быть 100%)'}
                </div>
              </div>
            )}

            {monthlyIncome && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  Расчёт бюджета
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-green-700 dark:text-green-300 font-medium">Потребности</div>
                    <div className="text-lg font-bold text-green-800 dark:text-green-200">
                      {formatCurrency(amounts.needs)}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-700 dark:text-blue-300 font-medium">Желания</div>
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                      {formatCurrency(amounts.wants)}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-700 dark:text-purple-300 font-medium">Сбережения</div>
                    <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
                      {formatCurrency(amounts.savings)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} className="mr-2" /> Назад
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedTemplate.id === 'custom' && totalPercentage !== 100}
              >
                Далее <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Шаг 3: Назначение категорий */}
      {step === 3 && (
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🏷️</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Распределите категории по группам
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Назначьте каждую категорию расходов в соответствующую группу
              </p>
            </div>

            {expenseCategories.length === 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <p className="text-yellow-800 dark:text-yellow-200">
                  У вас нет категорий расходов. Создайте категории в разделе "Категории" перед настройкой бюджета.
                </p>
              </div>
            )}

            {expenseCategories.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Потребности */}
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                    <span>🏠</span> Потребности ({formatCurrency(amounts.needs)})
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    Обязательные расходы для жизни
                  </p>
                  <div className="space-y-2">
                    {expenseCategories.map(category => (
                      <label key={`needs-${category.id}`} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`category-${category.id}`}
                          checked={categoryAssignments[category.id] === 'needs'}
                          onChange={() => assignCategoryToGroup(category.id, 'needs')}
                          className="text-green-600"
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Желания */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                    <span>🎯</span> Желания ({formatCurrency(amounts.wants)})
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                    Развлечения и необязательные покупки
                  </p>
                  <div className="space-y-2">
                    {expenseCategories.map(category => (
                      <label key={`wants-${category.id}`} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`category-${category.id}`}
                          checked={categoryAssignments[category.id] === 'wants'}
                          onChange={() => assignCategoryToGroup(category.id, 'wants')}
                          className="text-blue-600"
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Сбережения */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                    <span>💰</span> Сбережения ({formatCurrency(amounts.savings)})
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                    Накопления и инвестиции
                  </p>
                  <div className="space-y-2">
                    {expenseCategories.map(category => (
                      <label key={`savings-${category.id}`} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`category-${category.id}`}
                          checked={categoryAssignments[category.id] === 'savings'}
                          onChange={() => assignCategoryToGroup(category.id, 'savings')}
                          className="text-purple-600"
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-slate-900 dark:text-slate-100">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ArrowLeft size={16} className="mr-2" /> Назад
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={onClose}>
                  Отмена
                </Button>
                <Button 
                  onClick={handleComplete}
                  disabled={expenseCategories.length === 0 || Object.keys(categoryAssignments).length === 0}
                >
                  Создать бюджет
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
