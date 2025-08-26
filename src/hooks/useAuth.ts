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
    // Принудительно завершаем загрузку через 3 секунды максимум
    const forceLoadingTimeout = setTimeout(() => {
      console.warn('Force completing auth loading due to timeout')
      setAuthState(prev => ({ ...prev, loading: false }))
    }, 3000)

    // Если Supabase не настроен, сразу завершаем загрузку
    if (!isSupabaseConfigured || !supabase) {
      clearTimeout(forceLoadingTimeout)
      setAuthState(prev => ({ ...prev, loading: false }))
      return
    }

    // Простая инициализация без сложной логики
    const initAuth = async () => {
      try {
        // Быстро получаем сессию с таймаутом
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 2000)
        )

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any

        if (error) {
          console.warn('Session error:', error.message)
          setAuthState(prev => ({ 
            ...prev, 
            loading: false,
            error: null,
            isSupabaseEnabled: false
          }))
        } else {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false,
            error: null
          }))
        }
      } catch (error) {
        console.warn('Auth init failed:', error)
        setAuthState(prev => ({ 
          ...prev, 
          loading: false,
          error: null,
          isSupabaseEnabled: false
        }))
      }

      clearTimeout(forceLoadingTimeout)
    }

    initAuth()

    // Простой auth listener без сложной логики
    let subscription: any = null
    
    if (supabase) {
      try {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth state changed:', event)
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false,
            error: null
          }))
        })
        
        subscription = data.subscription
      } catch (error) {
        console.warn('Auth listener failed:', error)
      }
    }

    return () => {
      clearTimeout(forceLoadingTimeout)
      if (subscription) {
        subscription.unsubscribe()
      }
    }
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
