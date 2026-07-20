import React from "react";
import { GripVertical, type LucideIcon } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface SidebarMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  isDraggedOver: boolean;
  isBeingDragged: boolean;
  isDragging: boolean;
  onDragStart: (event: React.DragEvent, itemId: string) => void;
  onDragEnd: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragEnter: (event: React.DragEvent, itemId: string) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent, targetItemId: string) => void;
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
  onClick,
}: SidebarMenuItemProps) {
  const Icon = item.icon;

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, item.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={(event) => onDragEnter(event, item.id)}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(event, item.id)}
      className={`
        group relative cursor-move transition-all duration-200
        ${isDraggedOver && !isBeingDragged ? "scale-105" : ""}
        ${isBeingDragged ? "rotate-2 opacity-50" : ""}
      `}
    >
      {isDraggedOver && !isBeingDragged && (
        <div className="absolute -top-1 left-0 right-0 z-10 h-0.5 rounded-full bg-blue-500" />
      )}

      <button
        type="button"
        onClick={() => onClick(item.id)}
        className={`
          group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200
          ${
            isActive
              ? "scale-[1.02] bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 shadow-lg shadow-blue-500/10 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-100"
              : "text-slate-600 hover:scale-[1.01] hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
          }
          ${isDragging && !isBeingDragged ? "hover:bg-blue-50 dark:hover:bg-blue-900/20" : ""}
        `}
      >
        <div
          className={`cursor-grab opacity-0 transition-opacity duration-200 active:cursor-grabbing group-hover:opacity-100 ${
            isDragging ? "opacity-100" : ""
          }`}
        >
          <GripVertical size={14} className="text-slate-400" />
        </div>

        <div
          className={`rounded-xl p-2 transition-all duration-200 ${
            isActive
              ? "bg-white shadow-md dark:bg-slate-800"
              : "group-hover:bg-white group-hover:shadow-sm dark:group-hover:bg-slate-800"
          }`}
        >
          <Icon size={18} className={isActive ? item.color : "text-current"} />
        </div>

        <span className="flex-1 font-semibold">{item.label}</span>

        {isActive && (
          <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
        )}
      </button>
    </div>
  );
}
