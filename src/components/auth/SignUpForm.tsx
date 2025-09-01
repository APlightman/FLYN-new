import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { Input } from '../ui/Input'

interface SignUpFormProps {
  formData: {
    email: string
    password: string
    fullName: string
    confirmPassword: string
  }
  errors: Record<string, string>
  updateField: (field: string, value: string) => void
}

export function SignUpForm({ formData, errors, updateField }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      <Input
        label="Полное имя"
        type="text"
        value={formData.fullName}
        onChange={(e) => updateField('fullName', e.target.value)}
        leftIcon={<User size={16} />}
        error={errors.fullName}
        fullWidth
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => updateField('email', e.target.value)}
        leftIcon={<Mail size={16} />}
        error={errors.email}
        fullWidth
        required
      />

      <Input
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={(e) => updateField('password', e.target.value)}
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

      <Input
        label="Подтвердите пароль"
        type={showPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={(e) => updateField('confirmPassword', e.target.value)}
        leftIcon={<Lock size={16} />}
        error={errors.confirmPassword}
        fullWidth
        required
      />
    </>
  )
}
