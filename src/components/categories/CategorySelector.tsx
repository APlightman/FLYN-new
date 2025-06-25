import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface CategorySelectorProps {
  value: string;
  onChange: (categoryName: string) => void;
  type?: 'income' | 'expense';
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  error?: string;
}

export function CategorySelector({ 
  value, 
  onChange, 
  type, 
  placeholder = 'Выберите категорию',
  required = false,
  fullWidth = false,
  error
}: CategorySelectorProps) {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
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
    return state.categories.filter(cat => 
      !cat.parent && (!type || cat.type === type)
    );
  };

  const getSelectedCategory = () => {
    return state.categories.find(cat => cat.name === value);
  };

  const handleCategorySelect = (categoryName: string) => {
    onChange(categoryName);
    setIsOpen(false);
  };

  const renderCategory = (category: any, level: number = 0) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <div 
          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => handleCategorySelect(category.name)}
        >
          {hasSubcategories && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(category.id);
              }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
            </button>
          )}
          
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          
          <span className="text-sm text-slate-900 dark:text-slate-100">
            {category.name}
          </span>
        </div>
        
        {hasSubcategories && isExpanded && (
          <div>
            {subcategories.map(subcat => renderCategory(subcat, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const selectedCategory = getSelectedCategory();
  const rootCategories = getRootCategories();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full rounded-full px-4 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-left flex items-center justify-between
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
            )}
            <span className={selectedCategory ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>
              {selectedCategory ? selectedCategory.name : placeholder}
            </span>
          </div>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {rootCategories.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                Нет доступных категорий
              </div>
            ) : (
              rootCategories.map(category => renderCategory(category))
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
