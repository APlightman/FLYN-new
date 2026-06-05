import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useApp } from "./AppContext";

// --- TYPES ---

export interface AppNotification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  source: "budget" | "goal" | "recurring" | "system" | "sync";
  action?: {
    label: string;
    handler: () => void;
  };
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<AppNotification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}

// --- CONTEXT ---

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// --- HELPERS ---

const createId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

// --- PROVIDER ---

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useApp();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const prevBudgetsRef = useRef<string>("");
  const prevGoalsRef = useRef<string>("");
  const prevRecurringRef = useRef<string>("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      const newNotification: AppNotification = {
        ...notification,
        id: createId(),
        timestamp: Date.now(),
        read: false,
      };

      setNotifications((prev) => {
        // Не добавляем дубликаты (одинаковый тип + сообщение в течение 5 минут)
        const isDuplicate = prev.some(
          (n) =>
            n.type === newNotification.type &&
            n.title === newNotification.title &&
            n.message === newNotification.message &&
            Date.now() - n.timestamp < 5 * 60 * 1000,
        );
        if (isDuplicate) return prev;

        return [newNotification, ...prev].slice(0, 50); // макс 50 уведомлений
      });
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // --- СИСТЕМНЫЕ СОБЫТИЯ ---

  // Бюджет: предупреждение о превышении
  useEffect(() => {
    const budgetsKey = JSON.stringify(
      state.budgets.map((b) => ({ id: b.id, amount: b.amount })),
    );
    if (prevBudgetsRef.current && prevBudgetsRef.current !== budgetsKey) {
      // Проверяем превышение бюджета
      state.budgets.forEach((budget) => {
        const category = state.categories.find(
          (c) => c.id === budget.categoryId,
        );
        const spent = state.transactions
          .filter((t) => t.type === "expense" && t.category === category?.name)
          .reduce((sum, t) => sum + t.amount, 0);

        const categoryName = category?.name || `категория #${budget.categoryId.slice(0, 6)}`;

        if (spent > budget.amount) {
          addNotification({
            type: "warning",
            title: "Бюджет превышен",
            message: `Бюджет "${categoryName}" превышен на ${(spent - budget.amount).toLocaleString("ru-RU")} ₽`,
            source: "budget",
          });
        } else if (spent > budget.amount * 0.85) {
          addNotification({
            type: "info",
            title: "Бюджет接近 к лимиту",
            message: `Бюджет "${categoryName}" израсходован на ${Math.round((spent / budget.amount) * 100)}%`,
            source: "budget",
          });
        }
      });
    }
    prevBudgetsRef.current = budgetsKey;
  }, [state.budgets, state.transactions, state.categories, addNotification]);

  // Цели: напоминание о дедлайне
  useEffect(() => {
    const goalsKey = JSON.stringify(
      state.goals.map((g) => ({ id: g.id, deadline: g.deadline })),
    );
    if (prevGoalsRef.current && prevGoalsRef.current !== goalsKey) {
      const now = new Date();
      state.goals.forEach((goal) => {
        const deadline = new Date(goal.deadline);
        const daysLeft = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysLeft <= 7 && daysLeft > 0) {
          addNotification({
            type: "warning",
            title: "Дедлайн цели",
            message: `До дедлайна цели "${goal.name}" осталось ${daysLeft} дн.`,
            source: "goal",
          });
        } else if (daysLeft <= 0 && goal.currentAmount < goal.targetAmount) {
          addNotification({
            type: "error",
            title: "Цель не достигнута",
            message: `Дедлайн цели "${goal.name}" прошёл, но цель не достигнута`,
            source: "goal",
          });
        }
      });
    }
    prevGoalsRef.current = goalsKey;
  }, [state.goals, addNotification]);

  // Регулярные платежи: напоминание
  useEffect(() => {
    const recurringKey = JSON.stringify(
      state.recurringPayments.map((r) => ({ id: r.id, nextDate: r.nextDate })),
    );
    if (prevRecurringRef.current && prevRecurringRef.current !== recurringKey) {
      const now = new Date();
      state.recurringPayments.forEach((payment) => {
        const nextDate = new Date(payment.nextDate);
        const daysUntil = Math.ceil(
          (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntil <= 3 && daysUntil >= 0) {
          addNotification({
            type: "info",
            title: "Скоро регулярный платёж",
            message: `Платёж "${payment.description}" — ${daysUntil === 0 ? "сегодня" : `через ${daysUntil} дн.`}`,
            source: "recurring",
          });
        }
      });
    }
    prevRecurringRef.current = recurringKey;
  }, [state.recurringPayments, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// --- HOOK ---

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
