import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Home,
  PlusCircle,
  Target,
  Calendar,
  BarChart3,
  Settings,
  Repeat,
  Calculator,
  Tags,
  Download,
  HelpCircle,
  Pin,
  PinOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  behavior?: "fixed" | "collapse-hover" | "collapse-click";
}

const menuItems = [
  {
    id: "dashboard",
    label: "Главная",
    icon: Home,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "transactions",
    label: "Транзакции",
    icon: PlusCircle,
    color: "text-green-600 dark:text-green-400",
  },
  {
    id: "budget",
    label: "Бюджет",
    icon: Target,
    color: "text-red-600 dark:text-red-400",
  },
  {
    id: "goals",
    label: "Цели",
    icon: Target,
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "recurring",
    label: "Регулярные",
    icon: Repeat,
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "analytics",
    label: "Аналитика",
    icon: BarChart3,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "calendar",
    label: "Календарь",
    icon: Calendar,
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    id: "categories",
    label: "Категории",
    icon: Tags,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "calculator",
    label: "Калькулятор",
    icon: Calculator,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "import-export",
    label: "Импорт/Экспорт",
    icon: Download,
    color: "text-slate-600 dark:text-slate-400",
  },
  {
    id: "faq",
    label: "ЧаВо",
    icon: HelpCircle,
    color: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "settings",
    label: "Настройки",
    icon: Settings,
    color: "text-slate-600 dark:text-slate-400",
  },
];

export function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  behavior = "fixed",
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(behavior !== "fixed");
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isCollapsible =
    behavior === "collapse-hover" || behavior === "collapse-click";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Сброс состояния при смене поведения
  useEffect(() => {
    if (behavior === "fixed") {
      setCollapsed(false);
      setPinned(false);
    } else {
      setCollapsed(true);
      setPinned(false);
    }
  }, [behavior]);

  const isExpanded =
    behavior === "fixed" ||
    pinned ||
    (behavior === "collapse-hover" && hovered) ||
    (behavior === "collapse-click" && !collapsed);

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    if (isMobile) {
      onClose();
    }
  };

  const handleToggleCollapse = useCallback(() => {
    if (behavior === "collapse-click") {
      if (pinned) {
        setPinned(false);
        setCollapsed(true);
      } else {
        setCollapsed((prev) => !prev);
      }
    }
  }, [behavior, pinned]);

  const handleTogglePin = useCallback(() => {
    if (behavior === "collapse-click") {
      setPinned((prev) => !prev);
      if (pinned) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    }
  }, [behavior, pinned]);

  const handleMouseEnter = useCallback(() => {
    if (behavior === "collapse-hover") {
      setHovered(true);
    }
  }, [behavior]);

  const handleMouseLeave = useCallback(() => {
    if (behavior === "collapse-hover") {
      setHovered(false);
    }
  }, [behavior]);

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed lg:static left-0 top-0 h-full lg:h-[calc(100vh-5rem)]
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
          border-r border-slate-200/60 dark:border-slate-700/60
          z-30 lg:z-0 transition-all duration-300 ease-in-out
          ${
            isMobile
              ? `transform ${isOpen ? "translate-x-0" : "-translate-x-full"} pt-20`
              : "translate-x-0 pt-0"
          }
          ${!isMobile && isCollapsible ? (isExpanded ? "w-72" : "w-16") : "w-72"}
        `}
      >
        <div
          className={`p-4 lg:p-6 space-y-2 h-full overflow-y-auto ${!isExpanded && !isMobile && isCollapsible ? "overflow-hidden" : ""}`}
        >
          {/* Заголовок */}
          <div
            className={`flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60 dark:border-slate-700/60 ${!isExpanded && !isMobile && isCollapsible ? "justify-center" : ""}`}
          >
            {isExpanded && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Навигация
              </span>
            )}
            {!isMobile && isCollapsible && behavior === "collapse-click" && (
              <button
                onClick={handleTogglePin}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={pinned ? "Открепить" : "Закрепить"}
              >
                {pinned ? (
                  <PinOff size={14} className="text-slate-400" />
                ) : (
                  <Pin size={14} className="text-slate-400" />
                )}
              </button>
            )}
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-left transition-all duration-200 group
                    ${!isExpanded && !isMobile && isCollapsible ? "justify-center px-2" : ""}
                    ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-900 dark:text-blue-100 shadow-lg shadow-blue-500/10 scale-[1.02]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 hover:scale-[1.01]"
                    }
                  `}
                  title={!isExpanded && isCollapsible ? item.label : undefined}
                >
                  <div
                    className={`
                    p-1.5 lg:p-2 rounded-lg lg:rounded-xl transition-all duration-200 flex-shrink-0
                    ${
                      activeTab === item.id
                        ? "bg-white dark:bg-slate-800 shadow-md"
                        : "group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm"
                    }
                  `}
                  >
                    <IconComponent
                      size={16}
                      className={
                        activeTab === item.id ? item.color : "text-current"
                      }
                    />
                  </div>

                  {isExpanded && (
                    <span className="font-semibold flex-1 text-sm lg:text-base truncate">
                      {item.label}
                    </span>
                  )}

                  {isExpanded && activeTab === item.id && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Кнопка сворачивания/разворачивания для collapse-click */}
          {!isMobile && isCollapsible && behavior === "collapse-click" && (
            <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={handleToggleCollapse}
                className={`
                  w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl transition-all duration-200
                  text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300
                  ${!isExpanded ? "justify-center px-2" : ""}
                `}
                title={collapsed ? "Развернуть" : "Свернуть"}
              >
                {isExpanded ? (
                  <>
                    <ChevronLeft size={16} />
                    <span className="font-medium text-sm">Свернуть</span>
                  </>
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
