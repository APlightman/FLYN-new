import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { Button } from '../ui/Button';
import { UserMenu } from '../layout/UserMenu';

interface MobileHeaderProps {
  title: string;
  onMenuToggle: () => void;
  showSearch?: boolean;
  onSearchToggle?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

export function MobileHeader({ 
  title, 
  onMenuToggle, 
  showSearch = false,
  onSearchToggle,
  showNotifications = false,
  notificationCount = 0
}: MobileHeaderProps) {
  const { user } = useFirebaseAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 lg:hidden transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-3 safe-area-inset">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMenuToggle}
            className="p-2 rounded-xl flex-shrink-0"
          >
            <Menu size={20} />
          </Button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showSearch && onSearchToggle && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSearchToggle}
              className="p-2 rounded-xl"
            >
              <Search size={18} />
            </Button>
          )}
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 rounded-xl relative"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </div>
              )}
            </Button>
          )}
          {user && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
