import React from 'react'

interface AuthHeaderProps {
  mode: 'signin' | 'signup' | 'reset' | 'uid'
}

export function AuthHeader({ mode }: AuthHeaderProps) {
  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Войдите в свой аккаунт'
      case 'signup': return 'Создайте новый аккаунт'
      case 'reset': return 'Восстановление пароля'
      case 'uid': return 'Вход по UID (для разработчиков)'
      default: return 'Войдите в свой аккаунт'
    }
  }

  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl text-white">💰</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        FinanceTracker
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        {getTitle()}
      </p>
    </div>
  )
}
