import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { BudgetEditForm } from './BudgetEditForm';
import { BudgetDeleteConfirm } from './BudgetDeleteConfirm';

interface BudgetEnvelopeProps {
  budget: {
    id: string;
    categoryId: string;
    amount: number;
    spent: number;
    remaining: number;
    period: 'monthly' | 'yearly';
    group?: 'needs' | 'wants' | 'savings';
    percentage?: number;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  onEdit?: () => void;
}

export function BudgetEnvelope({ budget, category, onEdit }: BudgetEnvelopeProps) {
  const [showActions, setShowActions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = () => {
    return budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getGroupInfo = () => {
    switch (budget.group) {
      case 'needs':
        return { icon: '🏠', label: 'Потребности', color: 'text-green-600 dark:text-green-400' };
      case 'wants':
        return { icon: '🎯', label: 'Желания', color: 'text-blue-600 dark:text-blue-400' };
      case 'savings':
        return { icon: '💰', label: 'Сбережения', color: 'text-purple-600 dark:text-purple-400' };
      default:
        return { icon: '📊', label: 'Бюджет', color: 'text-slate-600 dark:text-slate-400' };
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Предотвращаем открытие меню при клике на карточку
    if (e.target === e.currentTarget || (e.target as Element).closest('.budget-content')) {
      if (onEdit) {
        onEdit();
      }
    }
  };

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    setShowEditModal(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);
    setShowDeleteModal(true);
  };

  const isOverBudget = budget.spent > budget.amount;
  const progressPercentage = getProgressPercentage();
  const groupInfo = getGroupInfo();

  return (
    <>
      <Card 
        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer group ${
          isOverBudget ? 'ring-2 ring-red-500/30' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Заголовок конверта */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 budget-content">
            <div
              className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
              style={{ backgroundColor: category.color }}
            />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {category.name}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className={groupInfo.color}>
                  {groupInfo.icon} {groupInfo.label}
                </span>
                {budget.percentage && (
                  <span className="text-slate-500 dark:text-slate-400">
                    • {budget.percentage}%
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOverBudget && (
              <AlertTriangle className="text-red-500" size={20} />
            )}
            
            {/* Меню действий */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleActionsClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2"
              >
                <MoreVertical size={16} />
              </Button>
              
              {showActions && (
                <>
                  {/* Backdrop для закрытия меню */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowActions(false)}
                  />
                  
                  {/* Выпадающее меню */}
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 min-w-[160px]">
                    <button
                      onClick={handleEditClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors first:rounded-t-xl"
                    >
                      <Edit size={16} />
                      Редактировать
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors last:rounded-b-xl"
                    >
                      <Trash2 size={16} />
                      Удалить
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-4 budget-content">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">
              Потрачено
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
            {progressPercentage > 100 && (
              <div
                className="h-full bg-red-500 opacity-50"
                style={{ 
                  width: `${Math.min(progressPercentage - 100, 100)}%`,
                  marginTop: '-12px'
                }}
              />
            )}
          </div>
        </div>

        {/* Суммы */}
        <div className="grid grid-cols-3 gap-4 text-center budget-content">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Потрачено
            </div>
            <div className={`font-bold text-sm ${
              isOverBudget 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-slate-900 dark:text-slate-100'
            }`}>
              {formatCurrency(budget.spent)}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Лимит
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {formatCurrency(budget.amount)}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Остаток
            </div>
            <div className={`font-bold text-sm flex items-center justify-center gap-1 ${
              budget.remaining >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {budget.remaining >= 0 ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {formatCurrency(Math.abs(budget.remaining))}
            </div>
          </div>
        </div>

        {/* Предупреждения */}
        {progressPercentage >= 80 && progressPercentage < 100 && (
          <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg budget-content">
            <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300">
              <AlertTriangle size={12} />
              <span>Близко к лимиту ({progressPercentage.toFixed(0)}%)</span>
            </div>
          </div>
        )}

        {isOverBudget && (
          <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg budget-content">
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle size={12} />
              <span>
                Превышение на {formatCurrency(budget.spent - budget.amount)}
              </span>
            </div>
          </div>
        )}

        {/* Фоновый градиент группы */}
        <div 
          className={`absolute top-0 right-0 w-16 h-16 opacity-5 ${
            budget.group === 'needs' ? 'bg-green-500' :
            budget.group === 'wants' ? 'bg-blue-500' :
            budget.group === 'savings' ? 'bg-purple-500' : 'bg-slate-500'
          }`}
          style={{
            clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
          }}
        />

        {/* Индикатор кликабельности */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="text-xs text-slate-400 dark:text-slate-500">
            Нажмите для просмотра
          </div>
        </div>
      </Card>

      {/* Модальное окно редактирования */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Редактировать бюджет"
      >
        <BudgetEditForm
          budget={budget}
          onSuccess={() => setShowEditModal(false)}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Подтверждение удаления"
      >
        <BudgetDeleteConfirm
          budget={budget}
          onConfirm={() => setShowDeleteModal(false)}
          onCancel={() => setShowDeleteModal(false)}
        />
      </Modal>
    </>
  );
}