import React from 'react';

interface SidebarHeaderProps {
  onResetOrder: () => void;
}

export function SidebarHeader({ onResetOrder }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Навигация
      </span>
      <button
        onClick={onResetOrder}
        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        title="Сбросить порядок"
      >
        Сброс
      </button>
    </div>
  );
}
