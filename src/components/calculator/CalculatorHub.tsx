import React, { useState } from 'react';
import { Calculator, Home, Car, CreditCard, PiggyBank } from 'lucide-react';
import { Card } from '../ui/Card';
import { SavingsCalculator } from './SavingsCalculator';
import { MortgageCalculator } from './MortgageCalculator';
import { CarLoanCalculator } from './CarLoanCalculator';
import { ConsumerLoanCalculator } from './ConsumerLoanCalculator';

type CalculatorType = 'savings' | 'mortgage' | 'car' | 'consumer';

interface CalculatorTab {
  id: CalculatorType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  color: string;
}

const calculatorTabs: CalculatorTab[] = [
  {
    id: 'savings',
    label: 'Накопления',
    icon: PiggyBank,
    description: 'Расчет инвестиций с учетом инфляции',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'mortgage',
    label: 'Ипотека',
    icon: Home,
    description: 'Расчет ипотечного кредита',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'car',
    label: 'Авто кредит',
    icon: Car,
    description: 'Кредит на автомобиль',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'consumer',
    label: 'Потребительский',
    icon: CreditCard,
    description: 'Потребительский кредит',
    color: 'text-orange-600 dark:text-orange-400'
  }
];

export function CalculatorHub() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('savings');

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'savings':
        return <SavingsCalculator />;
      case 'mortgage':
        return <MortgageCalculator />;
      case 'car':
        return <CarLoanCalculator />;
      case 'consumer':
        return <ConsumerLoanCalculator />;
      default:
        return <SavingsCalculator />;
    }
  };

  const activeTab = calculatorTabs.find(tab => tab.id === activeCalculator);

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/25">
          <Calculator className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Финансовые калькуляторы
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Умные расчеты с учетом инфляции и реальных условий
          </p>
        </div>
      </div>

      {/* Переключатель калькуляторов */}
      <Card variant="elevated">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {calculatorTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeCalculator === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCalculator(tab.id)}
                className={`
                  p-4 rounded-2xl transition-all duration-300 text-left group
                  ${isActive
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 scale-105 shadow-lg shadow-blue-500/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-102'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`
                    p-2 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-white dark:bg-slate-800 shadow-md' 
                      : 'group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm'
                    }
                  `}>
                    <IconComponent 
                      size={20} 
                      className={isActive ? tab.color : 'text-slate-500 dark:text-slate-400'} 
                    />
                  </div>
                  <h3 className={`font-semibold ${
                    isActive 
                      ? 'text-blue-900 dark:text-blue-100' 
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {tab.label}
                  </h3>
                </div>
                <p className={`text-sm ${
                  isActive 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.description}
                </p>
                {isActive && (
                  <div className="mt-2 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Активный калькулятор */}
      <div className="transition-all duration-300">
        {renderCalculator()}
      </div>

      {/* Информационная панель */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          {activeTab && <activeTab.icon size={20} className={activeTab.color} />}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            О калькуляторе "{activeTab?.label}"
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Особенности расчета:
            </h4>
            {activeCalculator === 'savings' && (
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Сложный процент с настраиваемой капитализацией</li>
                <li>• Корректировка взносов на инфляцию</li>
                <li>• Обратный расчет (цель → взнос)</li>
                <li>• Визуализация потери от инфляции</li>
              </ul>
            )}
            {activeCalculator === 'mortgage' && (
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Аннуитетные и дифференцированные платежи</li>
                <li>• Досрочное погашение с выбором стратегии</li>
                <li>• Учет страхования и комиссий</li>
                <li>• Влияние инфляции на реальные выплаты</li>
              </ul>
            )}
            {activeCalculator === 'car' && (
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Расчет с первоначальным взносом</li>
                <li>• Учет остаточной стоимости</li>
                <li>• Trade-in и утилизационные программы</li>
                <li>• Сравнение с арендой (лизинг)</li>
              </ul>
            )}
            {activeCalculator === 'consumer' && (
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Эффективная процентная ставка</li>
                <li>• Скрытые комиссии и страховки</li>
                <li>• Стратегии досрочного погашения</li>
                <li>• Альтернативные источники финансирования</li>
              </ul>
            )}
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Полезные советы:
            </h4>
            {activeCalculator === 'savings' && (
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Увеличивайте взносы на уровень инфляции</li>
                <li>• Рассматривайте ОФЗ-ИН для защиты от инфляции</li>
                <li>• Диверсифицируйте инвестиционный портфель</li>
                <li>• Пересматривайте цели каждые 2-3 года</li>
              </ul>
            )}
            {activeCalculator === 'mortgage' && (
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Сравните предложения 3-5 банков</li>
                <li>• Рассмотрите льготные программы</li>
                <li>• Учитывайте полную стоимость кредита</li>
                <li>• Страхуйте только обязательные риски</li>
              </ul>
            )}
            {activeCalculator === 'car' && (
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Сравните автокредит с потребительским</li>
                <li>• Учитывайте скорость обесценивания авто</li>
                <li>• Рассмотрите лизинг для бизнеса</li>
                <li>• Изучите программы господдержки</li>
              </ul>
            )}
            {activeCalculator === 'consumer' && (
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Внимательно читайте договор</li>
                <li>• Избегайте кредитов на потребление</li>
                <li>• Рассмотрите рефинансирование</li>
                <li>• Создайте план досрочного погашения</li>
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}