import { useState, useRef, useEffect } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const defaultMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Главная', icon: 'Home', color: 'text-blue-600 dark:text-blue-400' },
  { id: 'transactions', label: 'Транзакции', icon: 'PlusCircle', color: 'text-green-600 dark:text-green-400' },
  { id: 'filters', label: 'Фильтры', icon: 'Filter', color: 'text-purple-600 dark:text-purple-400' },
  { id: 'budget', label: 'Бюджет', icon: 'Target', color: 'text-red-600 dark:text-red-400' },
  { id: 'goals', label: 'Цели', icon: 'Target', color: 'text-orange-600 dark:text-orange-400' },
  { id: 'recurring', label: 'Регулярные', icon: 'Repeat', color: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart3', color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'calendar', label: 'Календарь', icon: 'Calendar', color: 'text-pink-600 dark:text-pink-400' },
  { id: 'categories', label: 'Категории', icon: 'Tags', color: 'text-cyan-600 dark:text-cyan-400' },
  { id: 'calculator', label: 'Калькулятор', icon: 'Calculator', color: 'text-amber-600 dark:text-amber-400' },
  { id: 'import-export', label: 'Импорт/Экспорт', icon: 'Download', color: 'text-slate-600 dark:text-slate-400' },
  { id: 'faq', label: 'ЧаВо', icon: 'HelpCircle', color: 'text-violet-600 dark:text-violet-400' },
  { id: 'settings', label: 'Настройки', icon: 'Settings', color: 'text-slate-600 dark:text-slate-400' },
];

const MENU_ORDER_KEY = 'sidebar-menu-order';
const SETTINGS_STORAGE_KEY = 'financeApp_settings';

export function useSidebarLogic() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [visibleTabs, setVisibleTabs] = useState<Record<string, boolean>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Загружаем настройки видимости вкладок
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.sidebarTabs) {
            setVisibleTabs(parsed.sidebarTabs);
          } else {
            const allVisible = defaultMenuItems.reduce((acc, item) => {
              acc[item.id] = true;
              return acc;
            }, {} as Record<string, boolean>);
            setVisibleTabs(allVisible);
          }
        } catch (error) {
          console.error('Ошибка загрузки настроек видимости:', error);
          const allVisible = defaultMenuItems.reduce((acc, item) => {
            acc[item.id] = true;
            return acc;
          }, {} as Record<string, boolean>);
          setVisibleTabs(allVisible);
        }
      } else {
        const allVisible = defaultMenuItems.reduce((acc, item) => {
          acc[item.id] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setVisibleTabs(allVisible);
      }
    };

    loadSettings();

    const handleSettingsSaved = (event: CustomEvent) => {
      if (event.detail.sidebarTabs) {
        setVisibleTabs(event.detail.sidebarTabs);
      }
    };

    window.addEventListener('settingsSaved', handleSettingsSaved as EventListener);

    return () => {
      window.removeEventListener('settingsSaved', handleSettingsSaved as EventListener);
    };
  }, []);

  // Загружаем сохранённый порядок при монтировании
  useEffect(() => {
    const savedOrder = localStorage.getItem(MENU_ORDER_KEY);
    if (savedOrder) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const reorderedItems = orderIds
          .map((id: string) => defaultMenuItems.find(item => item.id === id))
          .filter(Boolean);
        
        const existingIds = new Set(orderIds);
        const newItems = defaultMenuItems.filter(item => !existingIds.has(item.id));
        
        setMenuItems([...reorderedItems, ...newItems]);
      } catch (error) {
        console.error('Ошибка загрузки порядка меню:', error);
      }
    }
  }, []);

  const saveMenuOrder = (items: MenuItem[]) => {
    const orderIds = items.map(item => item.id);
    localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(orderIds));
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemId);
    
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    setDragOverItem(null);
    setIsDragging(false);
    dragCounter.current = 0;
    
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverItem(itemId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetItemId) {
      return;
    }

    const newItems = [...menuItems];
    const draggedIndex = newItems.findIndex(item => item.id === draggedItem);
    const targetIndex = newItems.findIndex(item => item.id === targetItemId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedElement] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedElement);
      
      setMenuItems(newItems);
      saveMenuOrder(newItems);
    }

    setDraggedItem(null);
    setDragOverItem(null);
    setIsDragging(false);
    dragCounter.current = 0;
  };

  const resetMenuOrder = () => {
    setMenuItems(defaultMenuItems);
    localStorage.removeItem(MENU_ORDER_KEY);
  };

  const visibleMenuItems = menuItems.filter(item => visibleTabs[item.id] !== false);

  return {
    menuItems,
    visibleMenuItems,
    draggedItem,
    dragOverItem,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    resetMenuOrder
  };
}