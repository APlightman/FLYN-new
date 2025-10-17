import React, { useEffect } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

export function AuthCallback() {
  // Хотя Firebase SDK обрабатывает большинство вещей автоматически,
  // мы можем использовать этот компонент для отображения статуса и перенаправления.
  const { loading } = useFirebaseAuth();

  useEffect(() => {
    // Firebase onAuthStateChanged асинхронен. 
    // Как только состояние изменится, пользователь будет перенаправлен
    // основной логикой приложения (например, из App.tsx).
    // Здесь мы просто ждем завершения процесса и перенаправляем, если нужно.
    if (!loading) {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 1500); // Даем немного времени на отображение сообщения

      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Завершение аутентификации...
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Ваш статус входа обновляется. Сейчас вы будете перенаправлены.
        </p>
      </div>
    </div>
  );
}