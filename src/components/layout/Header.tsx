import React from 'react';
import { Moon, Sun, Menu, Wallet } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { Button } from '../ui/Button';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { state, toggleDarkMode } = useApp();
  const { user } = useFirebaseAuth();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 px-4 sm:px-6 py-4 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMenuToggle} 
            className="lg:hidden rounded-xl p-2 sm:p-3"
          >
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/25">
              <Wallet className="text-white" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                FinanceTracker
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Управление финансами
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleDarkMode}
            className="rounded-xl p-2 sm:p-3"
          >
            {state.darkMode ? (
              <Sun size={18} sm:size={20} className="text-amber-500" />
            ) : (
              <Moon size={18} sm:size={20} className="text-slate-600" />
            )}
          </Button>
          {user && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
