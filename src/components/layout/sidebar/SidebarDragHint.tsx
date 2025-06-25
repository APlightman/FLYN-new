import React from 'react';
import { GripVertical } from 'lucide-react';

interface SidebarDragHintProps {
  isDragging: boolean;
}

export function SidebarDragHint({ isDragging }: SidebarDragHintProps) {
  if (!isDragging) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
        <GripVertical size={16} />
        <span>Перетащите для изменения порядка</span>
      </div>
    </div>
  );
}
