import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured, getRedirectUrl } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isSupabaseEnabled: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isSupabaseEnabled: isSupabaseConfigured
  })

  useEffect(() => {
    // Если Supabase не настроен, сразу завершаем загрузку
    if (!isSupabaseConfigured || !supabase) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return
    }

    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error)
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
      } else {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false
        }))
      }
    })

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error: null
        }))

        // Создаем профиль пользователя при регистрации или подтверждении email
        if ((event === 'SIGNED_UP' || event === 'TOKEN_REFRESHED') && session?.user) {
          await createUserProfile(session.user)
        }
        
        // Показываем сообщения пользователю
        if (event === 'SIGNED_UP') {
          alert('Регистрация успешна! Проверьте email для подтверждения аккаунта.')
        }
        
        if (event === 'PASSWORD_RECOVERY') {
          alert('Ссылка для восстановления пароля отправлена на email.')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const createUserProfile = async (user: User) => {
    if (!supabase) return
    
    try {
      // Проверяем, существует ли уже профиль
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        console.log('Profile already exists')
        return
      }

      // Создаем новый профиль
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null
        })

      if (error) {
        console.error('Error creating user profile:', error)
      } else {
        console.log('User profile created successfully')
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase не настроен' } }
    }
    
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: getRedirectUrl('/auth/callback')
        }
      })

      if (error) throw error
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError.message, loading: false }))
      return { data: null, error: authError }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase не настроен' } }
    }
    
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { data, error: null }
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError.message, loading: false }))
      return { data: null, error: authError }
    }
  }

  const signOut = async () => {
    if (!supabase) return
    
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      const authError = error as AuthError
      setAuthState(prev => ({ ...prev, error: authError.message, loading: false }))
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase не настроен' } }
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('/auth/reset-password')
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      return { error: authError }
    }
  }

  const resendConfirmation = async (email: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase не настроен' } }
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: getRedirectUrl('/auth/callback')
        }
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      const authError = error as AuthError
      return { error: authError }
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmation
  }
}