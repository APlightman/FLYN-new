import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Проверяем наличие конфигурации Supabase
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Получаем текущий URL приложения
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:5173' // fallback для dev режима
}

// Создаем клиент только если есть конфигурация
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category: string
          description: string
          date: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          category: string
          description: string
          date: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense'
          amount?: number
          category?: string
          description?: string
          date?: string
          tags?: string[] | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string
          parent: string | null
          budget: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string
          parent?: string | null
          budget?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string
          parent?: string | null
          budget?: number | null
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'yearly'
          spent: number
          remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period: 'monthly' | 'yearly'
          spent?: number
          remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: 'monthly' | 'yearly'
          spent?: number
          remaining?: number
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string
          monthly_contribution: number
          priority: 'low' | 'medium' | 'high'
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          deadline: string
          monthly_contribution: number
          priority: 'low' | 'medium' | 'high'
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          deadline?: string
          monthly_contribution?: number
          priority?: 'low' | 'medium' | 'high'
          description?: string | null
          updated_at?: string
        }
      }
      recurring_payments: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          category: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
          cron_expression: string | null
          next_date: string
          is_active: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          category: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
          cron_expression?: string | null
          next_date: string
          is_active?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          category?: string
          frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
          cron_expression?: string | null
          next_date?: string
          is_active?: boolean
          description?: string | null
          updated_at?: string
        }
      }
    }
  }
}

// Утилита для проверки доступности Supabase
export const getSupabaseStatus = () => {
  if (!isSupabaseConfigured) {
    return {
      available: false,
      message: 'Supabase не настроен. Работаем в локальном режиме.'
    }
  }
  
  if (!supabase) {
    return {
      available: false,
      message: 'Ошибка подключения к Supabase.'
    }
  }
  
  return {
    available: true,
    message: 'Supabase подключен успешно.'
  }
}

// Утилита для получения правильного redirect URL
export const getRedirectUrl = (path: string = '') => {
  const baseUrl = getAppUrl()
  return `${baseUrl}${path}`
}