import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200
          hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md
          ${isOpen ? 'bg-slate-100 dark:bg-slate-800 shadow-md' : ''}
          focus:outline-none focus:ring-4 focus:ring-blue-500/30
        `}
      >
        <div className="relative">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Аватар"
              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/25">
              {getInitials(user.email || '')}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[120px]">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
            {user.email}
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/10 z-50 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Аватар"
                    className="w-12 h-12 rounded-full object-cover border-3 border-white dark:border-slate-700 shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/25">
                    {getInitials(user.email || '')}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user.user_metadata?.full_name || 'Пользователь'}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <Mail size={12} />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.created_at && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Calendar size={10} />
                      <span>С {formatDate(user.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="font-bold text-green-600 dark:text-green-400">
                    Активен
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Статус аккаунта
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {user.email_confirmed_at ? 'Подтвержден' : 'Не подтвержден'}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Email статус
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 text-left group"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                  <Settings size={16} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Настройки профиля
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Изменить данные аккаунта
                  </div>
                </div>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-left group"
              >
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                  <LogOut size={16} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-medium text-red-700 dark:text-red-300">
                    Выйти из аккаунта
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    Войти с другой учетной записью
                  </div>
                </div>
              </button>
            </div>
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                FinanceTracker v1.0.0
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}