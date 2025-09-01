import React from 'react'
import { Mail } from 'lucide-react'
import { Input } from '../ui/Input'

interface ResetPasswordFormProps {
  formData: {
    email: string
  }
  errors: Record<string, string>
  updateField: (field: string, value: string) => void
}

export function ResetPasswordForm({ formData, errors, updateField }: ResetPasswordFormProps) {
  return (
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
  )
}
