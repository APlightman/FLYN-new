import React from 'react'
import { Key } from 'lucide-react'
import { Input } from '../ui/Input'

interface UIDLoginFormProps {
  formData: {
    uid: string
  }
  errors: Record<string, string>
  updateField: (field: string, value: string) => void
}

export function UIDLoginForm({ formData, errors, updateField }: UIDLoginFormProps) {
  return (
    <Input
      label="Firebase UID пользователя"
      type="text"
      value={formData.uid}
      onChange={(e) => updateField('uid', e.target.value)}
      leftIcon={<Key size={16} />}
      error={errors.uid}
      placeholder="Например: abc123def456..."
      fullWidth
      required
    />
  )
}
