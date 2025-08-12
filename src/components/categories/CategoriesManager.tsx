import React, { useState } from 'react';
import { Plus, Edit, Trash2, Folder, FolderOpen, Tag } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Category } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { CategoryForm } from './CategoryForm';

export function CategoriesManager() {
  const { state, deleteCategory } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getSubcategories = (parentId: string) => {
    return state.categories.filter(cat => cat.parent === parentId);
  };

  const getRootCategories = () => {
    return state.categories.filter(cat => !cat.parent);
  };

  const getCategoryUsage = (categoryName: string) => {
    return state.transactions.filter(t => t.category === categoryName).length;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  const getCategoryTotal = (categoryName: string) => {
    return state.transactions
      .filter(t => t.category === categoryName)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const usage = getCategoryUsage(category.name);
    const total = getCategoryTotal(category.name);

    return (
      <div key={category.id} className="space-y-2">
        <div 
          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          style={{ marginLeft: `${level * 20}px` }}
        >
          <div className="flex items-center gap-3 flex-1">
            {hasSubcategories ? (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
              >
                {isExpanded ? (
                  <FolderOpen size={16} className="text-slate-600 dark:text-slate-400" />
                ) : (
                  <Folder size={16} className="text-slate-600 dark:text-slate-400" />
                )}
              </button>
            ) : (
              <Tag size={16} className="text-slate-600 dark:text-slate-400 ml-6" />
            )}
            
            <div
              className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-800"
              style={{ backgroundColor: category.color }}
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {category.name}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  category.type === 'income' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {category.type === 'income' ? 'Доход' : 'Расход'}
                </span>
              </div>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {usage} транзакций • {formatCurrency(total)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingCategory(category)}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteCategory(category.id)}
              disabled={usage > 0}
              title={usage > 0 ? 'Нельзя удалить категорию с транзакциями' : 'Удалить категорию'}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        
        {hasSubcategories && isExpanded && (
          <div className="space-y-2">
            {subcategories.map(subcat => renderCategory(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const incomeCategories = getRootCategories().filter(cat => cat.type === 'income');
  const expenseCategories = getRootCategories().filter(cat => cat.type === 'expense');

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl shadow-lg shadow-cyan-500/25">
            <Tag className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Управление категориями
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Организация доходов и расходов
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Добавить категорию
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Категории доходов
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {incomeCategories.length} категорий
            </span>
          </div>
          
          <div className="space-y-2">
            {incomeCategories.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Нет категорий доходов
              </div>
            ) : (
              incomeCategories.map(category => renderCategory(category))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Категории расходов
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {expenseCategories.length} категорий
            </span>
          </div>
          
          <div className="space-y-2">
            {expenseCategories.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Нет категорий расходов
              </div>
            ) : (
              expenseCategories.map(category => renderCategory(category))
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Статистика использования
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.categories
            .filter(cat => getCategoryUsage(cat.name) > 0)
            .sort((a, b) => getCategoryUsage(b.name) - getCategoryUsage(a.name))
            .slice(0, 6)
            .map(category => {
              const usage = getCategoryUsage(category.name);
              const total = getCategoryTotal(category.name);
              
              return (
                <div key={category.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {usage} транзакций
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(total)}
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Создать категорию"
      >
        <CategoryForm onSuccess={() => setShowForm(false)} />
      </Modal>

      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Редактировать категорию"
      >
        {editingCategory && (
          <CategoryForm
            initialData={editingCategory}
            onSuccess={() => setEditingCategory(null)}
          />
        )}
      </Modal>
    </div>
  );
}
