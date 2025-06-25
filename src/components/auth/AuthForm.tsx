import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, RefreshCw } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)

  const { signIn, signUp, resetPassword, resendConfirmation, loading, error } = useAuth()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }

    if (mode !== 'reset') {
      if (!formData.password) {
        newErrors.password = 'Пароль обязателен'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Пароль должен содержать минимум 6 символов'
      }

      if (mode === 'signup') {
        if (!formData.fullName) {
          newErrors.fullName = 'Имя обязательно'
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Пароли не совпадают'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      let result
      
      if (mode === 'signin') {
        result = await signIn(formData.email, formData.password)
        if (result.error && result.error.message.includes('Email not confirmed')) {
          setShowResendConfirmation(true)
          return
        }
      } else if (mode === 'signup') {
        result = await signUp(formData.email, formData.password, formData.fullName)
        if (!result.error) {
          alert('Регистрация успешна! Проверьте email для подтверждения аккаунта.')
          setMode('signin')
          return
        }
      } else {
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

  const handleResendConfirmation = async () => {
    try {
      const result = await resendConfirmation(formData.email)
      if (!result.error) {
        alert('Письмо с подтверждением отправлено повторно!')
        setShowResendConfirmation(false)
      }
    } catch (err) {
      console.error('Resend error:', err)
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' })
    setErrors({})
    setShowResendConfirmation(false)
  }

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md" variant="elevated">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">💰</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            FinanceTracker
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {mode === 'signin' && 'Войдите в свой аккаунт'}
            {mode === 'signup' && 'Создайте новый аккаунт'}
            {mode === 'reset' && 'Восстановление пароля'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Input
              label="Полное имя"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              leftIcon={<User size={16} />}
              error={errors.fullName}
              fullWidth
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail size={16} />}
            error={errors.email}
            fullWidth
            required
          />

          {mode !== 'reset' && (
            <Input
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password}
              fullWidth
              required
            />
          )}

          {mode === 'signup' && (
            <Input
              label="Подтвердите пароль"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword}
              fullWidth
              required
            />
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              {showResendConfirmation && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Отправить письмо повторно
                </button>
              )}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="mt-6"
          >
            {mode === 'signin' && 'Войти'}
            {mode === 'signup' && 'Создать аккаунт'}
            {mode === 'reset' && 'Отправить ссылку'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Забыли пароль?
              </button>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Зарегистрироваться
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Войти
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Вернуться к входу
            </button>
          )}
        </div>

        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Важно:</strong> После регистрации проверьте email и перейдите по ссылке для подтверждения аккаунта.
          </p>
        </div>
      </Card>
    </div>
  )
}