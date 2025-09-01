import React from 'react'

interface AuthFooterProps {
  mode: 'signin' | 'signup' | 'reset' | 'uid'
  onSwitchMode: (mode: 'signin' | 'signup' | 'reset' | 'uid') => void
}

export function AuthFooter({ mode, onSwitchMode }: AuthFooterProps) {
  return (
    <div className="mt-6 text-center space-y-2">
      {mode === 'signin' && (
        <>
          <button
            type="button"
            onClick={() => onSwitchMode('reset')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Забыли пароль?
          </button>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={() => onSwitchMode('signup')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Зарегистрироваться
            </button>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onSwitchMode('uid')}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Вход по UID (разработчики)
            </button>
          </div>
        </>
      )}

      {mode === 'signup' && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Уже есть аккаунт?{' '}
          <button
            type="button"
            onClick={() => onSwitchMode('signin')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Войти
          </button>
        </div>
      )}

      {(mode === 'reset' || mode === 'uid') && (
        <button
          type="button"
          onClick={() => onSwitchMode('signin')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Вернуться к входу
        </button>
      )}

      {mode === 'uid' && (
        <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Для разработчиков:</strong> Введите UID существующего пользователя Firebase Auth. 
            Система автоматически загрузит профиль и данные пользователя.
          </p>
        </div>
      )}

      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Firebase Auth:</strong> Безопасная аутентификация с автоматическим подтверждением email.
        </p>
      </div>
    </div>
  )
}
