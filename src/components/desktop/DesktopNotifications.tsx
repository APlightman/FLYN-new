import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useElectronIntegration } from '../../hooks/useElectronIntegration';

export function DesktopNotifications() {
  const { state } = useApp();
  const { isElectron, showNotification, updateTrayBadge } = useElectronIntegration();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (!isElectron) return;

    const checkBudgetAlerts = () => {
      const alerts = [];
      
      state.budgets.forEach(budget => {
        const category = state.categories.find(c => c.id === budget.categoryId);
        const spent = state.transactions
          .filter(t => t.type === 'expense' && t.category === category?.name)
          .reduce((sum, t) => sum + t.amount, 0);

        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

        if (percentage >= 100) {
          alerts.push({
            type: 'over_budget',
            category: category?.name,
            amount: spent - budget.amount,
            percentage
          });
        } else if (percentage >= 80) {
          alerts.push({
            type: 'approaching_budget',
            category: category?.name,
            percentage
          });
        }
      });

      updateTrayBadge(alerts.length);

      alerts.forEach(alert => {
        if (alert.type === 'over_budget') {
          showNotification({
            title: '🚨 Превышение бюджета!',
            body: `Бюджет "${alert.category}" превышен на ${formatCurrency(alert.amount)}`,
            onClick: true
          });
        } else if (alert.type === 'approaching_budget') {
          showNotification({
            title: '⚠️ Близко к лимиту',
            body: `Использовано ${alert.percentage.toFixed(0)}% бюджета "${alert.category}"`,
            silent: true,
            onClick: true
          });
        }
      });
    };

    const interval = setInterval(checkBudgetAlerts, 5 * 60 * 1000);
    checkBudgetAlerts();

    return () => clearInterval(interval);
  }, [state.budgets, state.transactions, state.categories, isElectron, showNotification, updateTrayBadge]);

  useEffect(() => {
    if (!isElectron) return;

    const checkGoalReminders = () => {
      const now = new Date();
      
      state.goals.forEach(goal => {
        const deadline = new Date(goal.deadline);
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        
        if (daysLeft === 7 && progress < 90) {
          showNotification({
            title: '🎯 Напоминание о цели',
            body: `До цели "${goal.name}" осталось 7 дней. Прогресс: ${progress.toFixed(0)}%`,
            onClick: true
          });
        }
        
        if (daysLeft === 1 && progress < 100) {
          showNotification({
            title: '⏰ Завтра дедлайн!',
            body: `Цель "${goal.name}" должна быть достигнута завтра`,
            onClick: true
          });
        }
      });
    };

    const checkDaily = () => {
      const now = new Date();
      if (now.getHours() === 9 && now.getMinutes() === 0) {
        checkGoalReminders();
      }
    };

    const interval = setInterval(checkDaily, 60 * 1000);
    return () => clearInterval(interval);
  }, [state.goals, isElectron, showNotification]);

  return null;
}
