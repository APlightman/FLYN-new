import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { TrendingUp, TrendingDown, Wallet, Target, WifiOff } from 'lucide-react';
import { isFirebaseConfigured } from '../../lib/firebase';
import { isElectronApp } from '../../hooks/useElectronIntegration';

export function Dashboard() {
  const { state, isOnline } = useApp();
  
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  const recentTransactions = state.transactions
    .slice(0, 5)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {!isOnline && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 flex items-center gap-2">
          <WifiOff size={16} className="text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <span className="text-sm text-orange-700 dark:text-orange-300">
            Работаем в оффлайн режиме. Данные синхронизируются при подключении к интернету.
          </span>
        </div>
      )}

      {!isFirebaseConfigured && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-center gap-2">
          <Wallet size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Работаем в локальном режиме. Данные сохраняются только на этом устройстве.
          </span>
        </div>
      )}

      {isElectronApp() && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🖥️</div>
            <div>
              <div className="font-semibold text-blue-800 dark:text-blue-200">
                Десктопная версия FinanceTracker
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Используйте Ctrl+N для быстрого добавления транзакций или системный трей для доступа
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
          Главная панель
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base">
          Обзор ваших финансов
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl lg:rounded-2xl shadow-lg shadow-green-500/25 flex-shrink-0">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1 text-xs lg:text-sm">Доходы</p>
              <p className="text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400 truncate">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl lg:rounded-2xl shadow-lg shadow-red-500/25 flex-shrink-0">
              <TrendingDown className="text-white" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1 text-xs lg:text-sm">Расходы</p>
              <p className="text-lg lg:text-2xl font-bold text-red-600 dark:text-red-400 truncate">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0 ${
              balance >= 0 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25' 
                : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/25'
            }`}>
              <Wallet className="text-white" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1 text-xs lg:text-sm">Баланс</p>
              <p className={`text-lg lg:text-2xl font-bold truncate ${
                balance >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl lg:rounded-2xl shadow-lg shadow-purple-500/25 flex-shrink-0">
              <Target className="text-white" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1 text-xs lg:text-sm">Целей</p>
              <p className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {state.goals.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100">
            Последние транзакции
          </h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {recentTransactions.length} из {state.transactions.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 lg:py-12">
              <div className="text-slate-400 mb-4">
                <Wallet size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Нет транзакций
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {isElectronApp() 
                  ? 'Нажмите Ctrl+N для добавления первой транзакции' 
                  : 'Добавьте свою первую транзакцию'
                }
              </p>
            </div>
          ) : (
            recentTransactions.map((transaction) => {
              const category = state.categories.find(c => c.name === transaction.category);
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
                    <div
                      className="w-3 h-3 lg:w-4 lg:h-4 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: category?.color || '#6b7280' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm lg:text-base">
                        {transaction.description}
                      </p>
                      <div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="truncate">{transaction.category}</span>
                        <span>•</span>
                        <span className="flex-shrink-0">{new Date(transaction.date).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-bold text-sm lg:text-lg flex-shrink-0 ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}