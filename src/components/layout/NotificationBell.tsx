import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  BellRing,
  X,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  useNotifications,
  type AppNotification,
} from "../../contexts/NotificationContext";

const NOTIFICATION_ICONS: Record<AppNotification["type"], typeof Bell> = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
};

const NOTIFICATION_COLORS: Record<AppNotification["type"], string> = {
  info: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  warning:
    "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
  error: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  success:
    "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
};

const NOTIFICATION_BORDER: Record<AppNotification["type"], string> = {
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
  error: "border-l-red-500",
  success: "border-l-green-500",
};

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  return `${days} дн. назад`;
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Закрытие по клику вне
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const handleItemClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Уведомления"
      >
        {unreadCount > 0 ? (
          <BellRing size={18} className="text-amber-500 animate-pulse" />
        ) : (
          <Bell size={18} className="text-slate-600 dark:text-slate-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-500/30">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col overflow-hidden"
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Уведомления
              {notifications.length > 0 && (
                <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">
                  ({notifications.length})
                </span>
              )}
            </h3>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Прочитать все"
                >
                  <CheckCheck
                    size={14}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Очистить все"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              )}
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell
                  size={36}
                  className="text-slate-300 dark:text-slate-600 mb-3"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  Нет новых уведомлений
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => {
                  const IconComponent = NOTIFICATION_ICONS[notification.type];

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleItemClick(notification.id)}
                      className={`
                        relative px-4 py-3 cursor-pointer transition-all duration-150
                        border-l-4 ${NOTIFICATION_BORDER[notification.type]}
                        ${
                          notification.read
                            ? "bg-white dark:bg-slate-900 opacity-70"
                            : "bg-blue-50/50 dark:bg-blue-900/10"
                        }
                        hover:bg-slate-50 dark:hover:bg-slate-800/50
                      `}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${NOTIFICATION_COLORS[notification.type]}`}
                        >
                          <IconComponent size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-medium truncate ${
                                notification.read
                                  ? "text-slate-600 dark:text-slate-400"
                                  : "text-slate-900 dark:text-slate-100"
                              }`}
                            >
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.action && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                notification.action?.handler();
                              }}
                              className="mt-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Закрыть уведомление"
                        >
                          <X size={12} className="text-slate-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
