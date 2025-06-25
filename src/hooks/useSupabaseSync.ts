import { useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './useAuth'
import { Transaction, Category, Budget, FinancialGoal, RecurringPayment } from '../types'

interface SyncState {
  syncing: boolean
  lastSync: Date | null
  error: string | null
  retryCount: number
  isOnline: boolean
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
}

export function useSupabaseSync() {
  const { user, isSupabaseEnabled } = useAuth()
  const [syncState, setSyncState] = useState<SyncState>({
    syncing: false,
    lastSync: null,
    error: null,
    retryCount: 0,
    isOnline: navigator.onLine
  })

  // Проверяем доступность Supabase для операций
  const isAvailable = isSupabaseEnabled && isSupabaseConfigured && supabase && user

  // Утилита для retry логики с exponential backoff
  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG,
    operationName: string = 'operation'
  ): Promise<T> => {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        setSyncState(prev => ({ ...prev, retryCount: attempt }))
        
        const result = await operation()
        
        // Успешная операция - сбрасываем счетчик ошибок
        setSyncState(prev => ({ 
          ...prev, 
          error: null, 
          retryCount: 0 
        }))
        
        return result
      } catch (error) {
        lastError = error as Error
        
        console.warn(`${operationName} attempt ${attempt + 1} failed:`, error)
        
        // Если это последняя попытка, не ждем
        if (attempt === config.maxRetries) {
          break
        }
        
        // Exponential backoff с jitter
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          config.maxDelay
        )
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // Все попытки исчерпаны
    const errorMessage = `${operationName} failed after ${config.maxRetries + 1} attempts: ${lastError?.message}`
    
    setSyncState(prev => ({ 
      ...prev, 
      error: errorMessage,
      retryCount: 0
    }))
    
    throw new Error(errorMessage)
  }, [])

  // Безопасная обертка для операций с базой данных
  const safeDbOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string
  ): Promise<T> => {
    if (!isAvailable) {
      console.warn(`${operationName}: Supabase not available, returning fallback`)
      return fallbackValue
    }

    try {
      return await withRetry(operation, DEFAULT_RETRY_CONFIG, operationName)
    } catch (error) {
      console.error(`${operationName} failed completely:`, error)
      
      // Возвращаем fallback значение вместо краша
      return fallbackValue
    }
  }, [isAvailable, withRetry])

  // Синхронизация транзакций с улучшенной обработкой ошибок
  const syncTransactions = useCallback(async (localTransactions: Transaction[]) => {
    return await safeDbOperation(
      async () => {
        setSyncState(prev => ({ ...prev, syncing: true, error: null }))

        const { data: serverTransactions, error } = await supabase!
          .from('transactions')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(`Failed to fetch transactions: ${error.message}`)
        }

        const serverData: Transaction[] = serverTransactions?.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: t.date,
          tags: t.tags || undefined
        })) || []

        const serverIds = new Set(serverData.map(t => t.id))
        const newLocalTransactions = localTransactions.filter(t => !serverIds.has(t.id))

        if (newLocalTransactions.length > 0) {
          const { error: insertError } = await supabase!
            .from('transactions')
            .insert(
              newLocalTransactions.map(t => ({
                id: t.id,
                user_id: user!.id,
                type: t.type,
                amount: t.amount,
                category: t.category,
                description: t.description,
                date: t.date,
                tags: t.tags || null
              }))
            )

          if (insertError) {
            throw new Error(`Failed to insert transactions: ${insertError.message}`)
          }
        }

        const mergedTransactions = [...serverData, ...newLocalTransactions]

        setSyncState(prev => ({ 
          ...prev, 
          syncing: false, 
          lastSync: new Date(),
          error: null 
        }))

        console.log(`Transactions sync completed: ${serverData.length} from server, ${newLocalTransactions.length} uploaded`)
        return mergedTransactions
      },
      localTransactions,
      'syncTransactions'
    )
  }, [safeDbOperation, user])

  // Синхронизация категорий с улучшенной обработкой ошибок
  const syncCategories = useCallback(async (localCategories: Category[]) => {
    return await safeDbOperation(
      async () => {
        const { data: serverCategories, error } = await supabase!
          .from('categories')
          .select('*')
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to fetch categories: ${error.message}`)
        }

        const serverData: Category[] = serverCategories?.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          color: c.color,
          parent: c.parent || undefined,
          budget: c.budget || undefined
        })) || []

        const serverIds = new Set(serverData.map(c => c.id))
        const newLocalCategories = localCategories.filter(c => !serverIds.has(c.id))

        if (newLocalCategories.length > 0) {
          const { error: insertError } = await supabase!
            .from('categories')
            .insert(
              newLocalCategories.map(c => ({
                id: c.id,
                user_id: user!.id,
                name: c.name,
                type: c.type,
                color: c.color,
                parent: c.parent || null,
                budget: c.budget || null
              }))
            )

          if (insertError) {
            throw new Error(`Failed to insert categories: ${insertError.message}`)
          }
        }

        console.log(`Categories sync completed: ${serverData.length} from server, ${newLocalCategories.length} uploaded`)
        return [...serverData, ...newLocalCategories]
      },
      localCategories,
      'syncCategories'
    )
  }, [safeDbOperation, user])

  // Синхронизация бюджетов с улучшенной обработкой ошибок
  const syncBudgets = useCallback(async (localBudgets: Budget[]) => {
    return await safeDbOperation(
      async () => {
        const { data: serverBudgets, error } = await supabase!
          .from('budgets')
          .select('*')
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to fetch budgets: ${error.message}`)
        }

        const serverData: Budget[] = serverBudgets?.map(b => ({
          id: b.id,
          categoryId: b.category_id,
          amount: b.amount,
          period: b.period,
          spent: b.spent,
          remaining: b.remaining
        })) || []

        const serverIds = new Set(serverData.map(b => b.id))
        const newLocalBudgets = localBudgets.filter(b => !serverIds.has(b.id))

        if (newLocalBudgets.length > 0) {
          const { error: insertError } = await supabase!
            .from('budgets')
            .insert(
              newLocalBudgets.map(b => ({
                id: b.id,
                user_id: user!.id,
                category_id: b.categoryId,
                amount: b.amount,
                period: b.period,
                spent: b.spent
              }))
            )

          if (insertError) {
            throw new Error(`Failed to insert budgets: ${insertError.message}`)
          }
        }

        console.log(`Budgets sync completed: ${serverData.length} from server, ${newLocalBudgets.length} uploaded`)
        return [...serverData, ...newLocalBudgets]
      },
      localBudgets,
      'syncBudgets'
    )
  }, [safeDbOperation, user])

  // Синхронизация целей с улучшенной обработкой ошибок
  const syncGoals = useCallback(async (localGoals: FinancialGoal[]) => {
    return await safeDbOperation(
      async () => {
        const { data: serverGoals, error } = await supabase!
          .from('goals')
          .select('*')
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to fetch goals: ${error.message}`)
        }

        const serverData: FinancialGoal[] = serverGoals?.map(g => ({
          id: g.id,
          name: g.name,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount,
          deadline: g.deadline,
          monthlyContribution: g.monthly_contribution,
          priority: g.priority,
          description: g.description || undefined
        })) || []

        const serverIds = new Set(serverData.map(g => g.id))
        const newLocalGoals = localGoals.filter(g => !serverIds.has(g.id))

        if (newLocalGoals.length > 0) {
          const { error: insertError } = await supabase!
            .from('goals')
            .insert(
              newLocalGoals.map(g => ({
                id: g.id,
                user_id: user!.id,
                name: g.name,
                target_amount: g.targetAmount,
                current_amount: g.currentAmount,
                deadline: g.deadline,
                monthly_contribution: g.monthlyContribution,
                priority: g.priority,
                description: g.description || null
              }))
            )

          if (insertError) {
            throw new Error(`Failed to insert goals: ${insertError.message}`)
          }
        }

        console.log(`Goals sync completed: ${serverData.length} from server, ${newLocalGoals.length} uploaded`)
        return [...serverData, ...newLocalGoals]
      },
      localGoals,
      'syncGoals'
    )
  }, [safeDbOperation, user])

  // Синхронизация регулярных платежей с улучшенной обработкой ошибок
  const syncRecurringPayments = useCallback(async (localPayments: RecurringPayment[]) => {
    return await safeDbOperation(
      async () => {
        const { data: serverPayments, error } = await supabase!
          .from('recurring_payments')
          .select('*')
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to fetch recurring payments: ${error.message}`)
        }

        const serverData: RecurringPayment[] = serverPayments?.map(p => ({
          id: p.id,
          name: p.name,
          amount: p.amount,
          category: p.category,
          frequency: p.frequency,
          cronExpression: p.cron_expression || undefined,
          nextDate: p.next_date,
          isActive: p.is_active,
          description: p.description || undefined
        })) || []

        const serverIds = new Set(serverData.map(p => p.id))
        const newLocalPayments = localPayments.filter(p => !serverIds.has(p.id))

        if (newLocalPayments.length > 0) {
          const { error: insertError } = await supabase!
            .from('recurring_payments')
            .insert(
              newLocalPayments.map(p => ({
                id: p.id,
                user_id: user!.id,
                name: p.name,
                amount: p.amount,
                category: p.category,
                frequency: p.frequency,
                cron_expression: p.cronExpression || null,
                next_date: p.nextDate,
                is_active: p.isActive,
                description: p.description || null
              }))
            )

          if (insertError) {
            throw new Error(`Failed to insert recurring payments: ${insertError.message}`)
          }
        }

        console.log(`Recurring payments sync completed: ${serverData.length} from server, ${newLocalPayments.length} uploaded`)
        return [...serverData, ...newLocalPayments]
      },
      localPayments,
      'syncRecurringPayments'
    )
  }, [safeDbOperation, user])

  // CRUD операции с улучшенной обработкой ошибок
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    return await safeDbOperation(
      async () => {
        const newTransaction = {
          ...transaction,
          id: crypto.randomUUID()
        }

        const { error } = await supabase!
          .from('transactions')
          .insert({
            id: newTransaction.id,
            user_id: user!.id,
            type: newTransaction.type,
            amount: newTransaction.amount,
            category: newTransaction.category,
            description: newTransaction.description,
            date: newTransaction.date,
            tags: newTransaction.tags || null
          })

        if (error) {
          throw new Error(`Failed to add transaction: ${error.message}`)
        }

        console.log(`Transaction added: ${newTransaction.id}`)
        return newTransaction
      },
      null,
      'addTransaction'
    )
  }, [safeDbOperation, user])

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('transactions')
          .update({
            type: updates.type,
            amount: updates.amount,
            category: updates.category,
            description: updates.description,
            date: updates.date,
            tags: updates.tags || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to update transaction: ${error.message}`)
        }

        console.log(`Transaction updated: ${id}`)
        return true
      },
      false,
      'updateTransaction'
    )
  }, [safeDbOperation, user])

  const deleteTransaction = useCallback(async (id: string) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to delete transaction: ${error.message}`)
        }

        console.log(`Transaction deleted: ${id}`)
        return true
      },
      false,
      'deleteTransaction'
    )
  }, [safeDbOperation, user])

  // CRUD операции для категорий
  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    return await safeDbOperation(
      async () => {
        const newCategory = {
          ...category,
          id: crypto.randomUUID()
        }

        const { error } = await supabase!
          .from('categories')
          .insert({
            id: newCategory.id,
            user_id: user!.id,
            name: newCategory.name,
            type: newCategory.type,
            color: newCategory.color,
            parent: newCategory.parent || null,
            budget: newCategory.budget || null
          })

        if (error) {
          throw new Error(`Failed to add category: ${error.message}`)
        }

        console.log(`Category added: ${newCategory.id}`)
        return newCategory
      },
      null,
      'addCategory'
    )
  }, [safeDbOperation, user])

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('categories')
          .update({
            name: updates.name,
            type: updates.type,
            color: updates.color,
            parent: updates.parent || null,
            budget: updates.budget || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to update category: ${error.message}`)
        }

        console.log(`Category updated: ${id}`)
        return true
      },
      false,
      'updateCategory'
    )
  }, [safeDbOperation, user])

  const deleteCategory = useCallback(async (id: string) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to delete category: ${error.message}`)
        }

        console.log(`Category deleted: ${id}`)
        return true
      },
      false,
      'deleteCategory'
    )
  }, [safeDbOperation, user])

  // CRUD операции для бюджетов
  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    return await safeDbOperation(
      async () => {
        const newBudget = {
          ...budget,
          id: crypto.randomUUID()
        }

        const { error } = await supabase!
          .from('budgets')
          .insert({
            id: newBudget.id,
            user_id: user!.id,
            category_id: newBudget.categoryId,
            amount: newBudget.amount,
            period: newBudget.period,
            spent: newBudget.spent
          })

        if (error) {
          throw new Error(`Failed to add budget: ${error.message}`)
        }

        console.log(`Budget added: ${newBudget.id}`)
        return newBudget
      },
      null,
      'addBudget'
    )
  }, [safeDbOperation, user])

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('budgets')
          .update({
            category_id: updates.categoryId,
            amount: updates.amount,
            period: updates.period,
            spent: updates.spent,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to update budget: ${error.message}`)
        }

        console.log(`Budget updated: ${id}`)
        return true
      },
      false,
      'updateBudget'
    )
  }, [safeDbOperation, user])

  const deleteBudget = useCallback(async (id: string) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('budgets')
          .delete()
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to delete budget: ${error.message}`)
        }

        console.log(`Budget deleted: ${id}`)
        return true
      },
      false,
      'deleteBudget'
    )
  }, [safeDbOperation, user])

  // CRUD операции для целей
  const addGoal = useCallback(async (goal: Omit<FinancialGoal, 'id'>) => {
    return await safeDbOperation(
      async () => {
        const newGoal = {
          ...goal,
          id: crypto.randomUUID()
        }

        const { error } = await supabase!
          .from('goals')
          .insert({
            id: newGoal.id,
            user_id: user!.id,
            name: newGoal.name,
            target_amount: newGoal.targetAmount,
            current_amount: newGoal.currentAmount,
            deadline: newGoal.deadline,
            monthly_contribution: newGoal.monthlyContribution,
            priority: newGoal.priority,
            description: newGoal.description || null
          })

        if (error) {
          throw new Error(`Failed to add goal: ${error.message}`)
        }

        console.log(`Goal added: ${newGoal.id}`)
        return newGoal
      },
      null,
      'addGoal'
    )
  }, [safeDbOperation, user])

  const updateGoal = useCallback(async (id: string, updates: Partial<FinancialGoal>) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('goals')
          .update({
            name: updates.name,
            target_amount: updates.targetAmount,
            current_amount: updates.currentAmount,
            deadline: updates.deadline,
            monthly_contribution: updates.monthlyContribution,
            priority: updates.priority,
            description: updates.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to update goal: ${error.message}`)
        }

        console.log(`Goal updated: ${id}`)
        return true
      },
      false,
      'updateGoal'
    )
  }, [safeDbOperation, user])

  const deleteGoal = useCallback(async (id: string) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('goals')
          .delete()
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to delete goal: ${error.message}`)
        }

        console.log(`Goal deleted: ${id}`)
        return true
      },
      false,
      'deleteGoal'
    )
  }, [safeDbOperation, user])

  // CRUD операции для регулярных платежей
  const addRecurringPayment = useCallback(async (payment: Omit<RecurringPayment, 'id'>) => {
    return await safeDbOperation(
      async () => {
        const newPayment = {
          ...payment,
          id: crypto.randomUUID()
        }

        const { error } = await supabase!
          .from('recurring_payments')
          .insert({
            id: newPayment.id,
            user_id: user!.id,
            name: newPayment.name,
            amount: newPayment.amount,
            category: newPayment.category,
            frequency: newPayment.frequency,
            cron_expression: newPayment.cronExpression || null,
            next_date: newPayment.nextDate,
            is_active: newPayment.isActive,
            description: newPayment.description || null
          })

        if (error) {
          throw new Error(`Failed to add recurring payment: ${error.message}`)
        }

        console.log(`Recurring payment added: ${newPayment.id}`)
        return newPayment
      },
      null,
      'addRecurringPayment'
    )
  }, [safeDbOperation, user])

  const updateRecurringPayment = useCallback(async (id: string, updates: Partial<RecurringPayment>) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('recurring_payments')
          .update({
            name: updates.name,
            amount: updates.amount,
            category: updates.category,
            frequency: updates.frequency,
            cron_expression: updates.cronExpression || null,
            next_date: updates.nextDate,
            is_active: updates.isActive,
            description: updates.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to update recurring payment: ${error.message}`)
        }

        console.log(`Recurring payment updated: ${id}`)
        return true
      },
      false,
      'updateRecurringPayment'
    )
  }, [safeDbOperation, user])

  const deleteRecurringPayment = useCallback(async (id: string) => {
    return await safeDbOperation(
      async () => {
        const { error } = await supabase!
          .from('recurring_payments')
          .delete()
          .eq('id', id)
          .eq('user_id', user!.id)

        if (error) {
          throw new Error(`Failed to delete recurring payment: ${error.message}`)
        }

        console.log(`Recurring payment deleted: ${id}`)
        return true
      },
      false,
      'deleteRecurringPayment'
    )
  }, [safeDbOperation, user])

  // Функция для ручного retry синхронизации
  const retrySync = useCallback(async () => {
    setSyncState(prev => ({ ...prev, error: null, retryCount: 0 }))
    
    // Здесь можно добавить логику повторной синхронизации
    console.log('Manual retry initiated')
  }, [])

  return {
    syncState,
    isSupabaseAvailable: isAvailable,
    retrySync,
    syncTransactions,
    syncCategories,
    syncBudgets,
    syncGoals,
    syncRecurringPayments,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment
  }
}
