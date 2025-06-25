import React from 'react';
import { GripVertical } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color: string;
}

interface SidebarMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  isDraggedOver: boolean;
  isBeingDragged: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent, itemId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetItemId: string) => void;
  onClick: (itemId: string) => void;
}

export function SidebarMenuItem({
  item,
  isActive,
  isDraggedOver,
  isBeingDragged,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onClick
}: SidebarMenuItemProps) {
  const Icon = item.icon;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, item.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, item.id)}
      className={`
        group relative cursor-move transition-all duration-200
        ${isDraggedOver && !isBeingDragged ? 'transform scale-105' : ''}
        ${isBeingDragged ? 'opacity-50 transform rotate-2' : ''}
      `}
    >
      {/* Индикатор места вставки */}
      {isDraggedOver && !isBeingDragged && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
      )}
      
      <button
        onClick={() => onClick(item.id)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 group
          ${isActive 
            ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-900 dark:text-blue-100 shadow-lg shadow-blue-500/10 scale-[1.02]' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 hover:scale-[1.01]'
          }
          ${isDragging && !isBeingDragged ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
        `}
      >
        {/* Drag handle */}
        <div className={`
          opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing
          ${isDragging ? 'opacity-100' : ''}
        `}>
          <GripVertical size={14} className="text-slate-400" />
        </div>

        <div className={`
          p-2 rounded-xl transition-all duration-200
          ${isActive 
            ? 'bg-white dark:bg-slate-800 shadow-md' 
            : 'group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm'
          }
        `}>
          <Icon size={18} className={isActive ? item.color : 'text-current'} />
        </div>
        
        <span className="font-semibold flex-1">{item.label}</span>
        
        {isActive && (
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
        )}
      </button>
    </div>
  );
}
