import React, { useState } from 'react'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'
import { Card } from '../ui/Card'
import { AuthHeader } from './AuthHeader'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'
import { ResetPasswordForm } from './ResetPasswordForm'
import { UIDLoginForm } from './UIDLoginForm'
import { AuthModeSwitch } from './AuthModeSwitch'
import { AuthFooter } from './AuthFooter'
import { FirebaseConfigChecker } from './FirebaseConfigChecker'
import { useAuthForm } from './useAuthForm'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'uid'>('signin')
  const { signIn, signUp, resetPassword, signInWithUID, loading, error, isFirebaseEnabled } = useFirebaseAuth()
  const { formData, errors, validateForm, resetForm, updateField } = useAuthForm()

  // Показываем проверку конфигурации если Firebase не настроен
  if (!isFirebaseEnabled) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🔥</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Требуется настройка Firebase
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Для работы аутентификации необходимо настроить Firebase
            </p>
          </div>
          
          <FirebaseConfigChecker />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              После настройки Firebase перезапустите приложение
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(mode)) return

    try {
      let result
      
      if (mode === 'signin') {
        // Официальный метод Firebase для входа
        result = await signIn(formData.email, formData.password)
      } else if (mode === 'signup') {
        // Официальный метод Firebase для регистрации
        result = await signUp(formData.email, formData.password, formData.fullName)
        if (!result.error) {
          alert('Регистрация успешна! Добро пожаловать!')
          return
        }
      } else if (mode === 'uid') {
        // Кастомный метод для разработки
        result = await signInWithUID(formData.uid)
        if (!result.error) {
          alert('Вход по UID успешен!')
          return
        }
      } else {
        // Сброс пароля через Firebase
        result = await resetPassword(formData.email)
        if (!result.error) {
          alert('Ссылка для сброса пароля отправлена на ваш email')
          setMode('signin')
          return
        }
      }

      if (result && !result.error && onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Auth error:', err)
    }
  }

  const switchMode = (newMode: 'signin' | 'signup' | 'reset' | 'uid') => {
    setMode(newMode)
    resetForm()
  }

  const renderForm = () => {
    switch (mode) {
      case 'signin':
        return <SignInForm formData={formData} errors={errors} updateField={updateField} />
      case 'signup':
        return <SignUpForm formData={formData} errors={errors} updateField={updateField} />
      case 'reset':
        return <ResetPasswordForm formData={formData} errors={errors} updateField={updateField} />
      case 'uid':
        return <UIDLoginForm formData={formData} errors={errors} updateField={updateField} />
      default:
        return <SignInForm formData={formData} errors={errors} updateField={updateField} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md" variant="elevated">
        <AuthHeader mode={mode} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderForm()}

          {/* Улучшенная обработка ошибок Firebase */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Ошибка аутентификации
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {error}
                  </p>
                  {error.includes('api-key-not-valid') && (
                    <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                        🔑 Проблема с API ключом Firebase:
                      </p>
                      <ul className="text-xs text-red-600 dark:text-red-400 mt-1 space-y-1">
                        <li>• Проверьте правильность VITE_FIREBASE_API_KEY в .env</li>
                        <li>• API ключ должен начинаться с "AIzaSy"</li>
                        <li>• Убедитесь, что используете ключ из Firebase Console</li>
                        <li>• Перезапустите сервер после изменения .env</li>
                      </ul>
                    </div>
                  )}
                  {error.includes('сети') && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                      💡 Проверьте подключение к интернету и попробуйте снова
                    </p>
                  )}
                  {error.includes('слишком много') && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                      ⏰ Подождите несколько минут перед следующей попыткой
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <AuthModeSwitch mode={mode} loading={loading} />
        </form>

        <AuthFooter mode={mode} onSwitchMode={switchMode} />
      </Card>
    </div>
  )
}
