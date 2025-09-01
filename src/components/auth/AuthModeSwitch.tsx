import React from 'react'
import { Button } from '../ui/Button'

interface AuthModeSwitchProps {
  mode: 'signin' | 'signup' | 'reset' | 'uid'
  loading: boolean
}

export function AuthModeSwitch({ mode, loading }: AuthModeSwitchProps) {
  const getButtonText = () => {
    switch (mode) {
      case 'signin': return 'Войти'
      case 'signup': return 'Создать аккаунт'
      case 'reset': return 'Отправить ссылку'
      case 'uid': return 'Войти по UID'
      default: return 'Войти'
    }
  }

  return (
    <Button
      type="submit"
      loading={loading}
      fullWidth
      className="mt-6"
    >
      {getButtonText()}
    </Button>
  )
}
