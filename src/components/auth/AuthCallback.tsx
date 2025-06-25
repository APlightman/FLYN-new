import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase) {
          setStatus('error')
          setMessage('Supabase не настроен')
          return
        }

        // Получаем параметры из URL
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const type = urlParams.get('type')

        if (type === 'signup' && accessToken && refreshToken) {
          // Подтверждение email при регистрации
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            setStatus('error')
            setMessage(`Ошибка подтверждения: ${error.message}`)
          } else {
            setStatus('success')
            setMessage('Email успешно подтвержден! Добро пожаловать!')
            
            // Перенаправляем на главную страницу через 2 секунды
            setTimeout(() => {
              window.location.href = '/'
            }, 2000)
          }
        } else if (type === 'recovery' && accessToken && refreshToken) {
          // Восстановление пароля
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            setStatus('error')
            setMessage(`Ошибка восстановления: ${error.message}`)
          } else {
            setStatus('success')
            setMessage('Сессия восстановлена! Теперь вы можете изменить пароль.')
            
            // Перенаправляем на страницу смены пароля
            setTimeout(() => {
              window.location.href = '/auth/reset-password'
            }, 2000)
          }
        } else {
          // Если нет нужных параметров, перенаправляем на главную
          window.location.href = '/'
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Произошла ошибка при обработке ссылки')
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Обработка ссылки...
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Пожалуйста, подождите
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
              Успешно!
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Ошибка
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {message}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться на главную
            </button>
          </>
        )}
      </div>
    </div>
  )
}