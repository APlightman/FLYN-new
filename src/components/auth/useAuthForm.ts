import { useState } from 'react'

interface AuthFormData {
  email: string
  password: string
  fullName: string
  confirmPassword: string
  uid: string
}

export function useAuthForm() {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    uid: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (mode: 'signin' | 'signup' | 'reset' | 'uid') => {
    const newErrors: Record<string, string> = {}

    if (mode === 'uid') {
      if (!formData.uid) {
        newErrors.uid = 'UID обязателен'
      } else if (formData.uid.length < 20) {
        newErrors.uid = 'UID должен содержать минимум 20 символов'
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

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

  const resetForm = () => {
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '', uid: '' })
    setErrors({})
  }

  return {
    formData,
    errors,
    validateForm,
    resetForm,
    updateField
  }
}
