import React, { useState } from 'react';
import { Repeat, Edit, Trash2, Plus, Play, Pause, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { RecurringPayment } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { RecurringPaymentForm } from './RecurringPaymentForm';

export function RecurringPaymentsManager() {
  const { state, deleteRecurringPayment, updateRecurringPayment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Ежедневно';
      case 'weekly': return 'Еженедельно';
      case 'monthly': return 'Ежемесячно';
      case 'yearly': return 'Ежегодно';
      case 'custom': return 'Настраиваемый';
      default: return frequency;
    }
  };

  const togglePaymentStatus = (payment: RecurringPayment) => {
    updateRecurringPayment(payment.id, { isActive: !payment.isActive });
  };

  const getNextPaymentDate = (payment: RecurringPayment) => {
    const nextDate = new Date(payment.nextDate);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Просрочен';
    } else if (diffDays === 0) {
      return 'Сегодня';
    } else if (diffDays === 1) {
      return 'Завтра';
    } else if (diffDays <= 7) {
      return `Через ${diffDays} дн.`;
    } else {
      return nextDate.toLocaleDateString('ru-RU');
    }
  };

  const getStatusColor = (payment: RecurringPayment) => {
    if (!payment.isActive) return 'text-slate-500 dark:text-slate-400';
    
    const nextDate = new Date(payment.nextDate);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 dark:text-red-400';
    if (diffDays <= 1) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = state.categories.find(c => c.name === categoryName);
    return category?.color || '#6b7280';
  };

  const activePayments = state.recurringPayments.filter(p => p.isActive);
  const inactivePayments = state.recurringPayments.filter(p => !p.isActive);

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/25">
            <Repeat className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Регулярные платежи
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Управление автоматическими транзакциями
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Добавить платеж
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Repeat className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Активных</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {activePayments.length}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Сегодня</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {activePayments.filter(p => getNextPaymentDate(p) === 'Сегодня').length}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Месячная сумма</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(
                  activePayments
                    .filter(p => p.frequency === 'monthly')
                    .reduce((sum, p) => sum + p.amount, 0)
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {state.recurringPayments.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Repeat className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Нет регулярных платежей
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Создайте автоматические платежи для повторяющихся транзакций
            </p>
            <Button onClick={() => setShowForm(true)}>
              Создать первый платеж
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Активные платежи */}
          {activePayments.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Активные платежи ({activePayments.length})
              </h3>
              
              <div className="space-y-3">
                {activePayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(payment.category) }}
                      />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {payment.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>{payment.category}</span>
                          <span>•</span>
                          <span>{getFrequencyText(payment.frequency)}</span>
                          <span>•</span>
                          <span className={getStatusColor(payment)}>
                            {getNextPaymentDate(payment)}
                          </span>
                        </div>
                        {payment.description && (
                          <div className="text-xs text-slate-400 mt-1">
                            {payment.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {getFrequencyText(payment.frequency)}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePaymentStatus(payment)}
                          title={payment.isActive ? 'Приостановить' : 'Активировать'}
                        >
                          {payment.isActive ? <Pause size={16} /> : <Play size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPayment(payment)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecurringPayment(payment.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Неактивные платежи */}
          {inactivePayments.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Приостановленные платежи ({inactivePayments.length})
              </h3>
              
              <div className="space-y-3">
                {inactivePayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(payment.category) }}
                      />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {payment.name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>{payment.category}</span>
                          <span>•</span>
                          <span>{getFrequencyText(payment.frequency)}</span>
                          <span>•</span>
                          <span className="text-slate-400">Приостановлен</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePaymentStatus(payment)}
                          title="Активировать"
                        >
                          <Play size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPayment(payment)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecurringPayment(payment.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Создать регулярный платеж"
      >
        <RecurringPaymentForm onSuccess={() => setShowForm(false)} />
      </Modal>

      <Modal
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        title="Редактировать регулярный платеж"
      >
        {editingPayment && (
          <RecurringPaymentForm
            initialData={editingPayment}
            onSuccess={() => setEditingPayment(null)}
          />
        )}
      </Modal>
    </div>
  );
}
