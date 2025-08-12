import React, { useState } from 'react';
import { Transaction, Category, formatCurrency } from '../../types';
import { Edit, Trash2, Plus, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TransactionForm } from '../transactions/TransactionForm';

interface CalendarDayProps {
  currentDate: Date;
  transactions: Transaction[];
  categories: Category[];
}

export function CalendarDay({ currentDate, transactions, categories }: CalendarDayProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6b7280';
  };

  const getDayStats = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses };
  };

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const category = transaction.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const stats = getDayStats();

  return (
    <div className="space-y-6">
      {/* Заголовок дня */}
      <div className="text-center">
        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {currentDate.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
          })}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Добавить транзакцию на этот день
          </Button>
        </div>
      </div>

      {/* Статистика дня */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(stats.income)}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">Доходы</div>
        </div>

        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(stats.expenses)}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">Расходы</div>
        </div>

        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
          <div className={`text-2xl font-bold ${
            stats.balance >= 0 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {formatCurrency(stats.balance)}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Баланс</div>
        </div>
      </div>

      {/* Транзакции по категориям */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Calendar size={32} className="text-slate-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Нет транзакций
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            В этот день не было совершено транзакций
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus size={16} className="mr-2" />
            Добавить первую транзакцию
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([categoryName, categoryTransactions]) => {
            const categoryTotal = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
            const categoryColor = getCategoryColor(categoryName);
            
            return (
              <div key={categoryName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoryColor }}
                    />
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {categoryName}
                    </h4>
                  </div>
                  <div className={`font-bold ${
                    categoryTransactions[0].type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(categoryTotal)}
                  </div>
                </div>

                <div className="space-y-2">
                  {categoryTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {transaction.description}
                        </div>
                        {transaction.tags && transaction.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {transaction.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-full text-xs text-slate-600 dark:text-slate-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`font-semibold ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTransaction(transaction);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Добавить функцию удаления
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модальные окна */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Добавить транзакцию"
      >
        <TransactionForm
          initialData={{
            id: '',
            type: 'expense',
            amount: 0,
            category: '',
            description: '',
            date: currentDate.toISOString().split('T')[0],
            tags: []
          }}
          onSuccess={() => setShowAddForm(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Редактировать транзакцию"
      >
        {editingTransaction && (
          <TransactionForm
            initialData={editingTransaction}
            onSuccess={() => setEditingTransaction(null)}
          />
        )}
      </Modal>
    </div>
  );
}
