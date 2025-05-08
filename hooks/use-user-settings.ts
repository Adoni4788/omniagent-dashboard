'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseClient } from '@/lib/supabase-client'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth, getUserId } from '@/lib/auth'
import { z } from 'zod'
import { useEffect } from 'react'

// Type for user settings
export interface UserSettings {
  id: string
  userId: string
  theme: 'light' | 'dark' | 'system'
  securityLevel: 'class1' | 'class2' | 'class3'
  notificationsEnabled: boolean
  defaultMode: 'assistant' | 'expert' | 'autonomous'
}

// Schema for validation
export const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  securityLevel: z.enum(['class1', 'class2', 'class3']),
  notificationsEnabled: z.boolean(),
  defaultMode: z.enum(['assistant', 'expert', 'autonomous']),
})

export type UserSettingsInput = z.infer<typeof UserSettingsSchema>

// Mock data for development without Supabase
const MOCK_USER_SETTINGS: UserSettings = {
  id: 'settings-1',
  userId: 'mock-user-id',
  theme: 'system',
  securityLevel: 'class2',
  notificationsEnabled: true,
  defaultMode: 'assistant',
}

// Function to safely check if we should use mock data
function shouldUseMockData(): boolean {
  return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
}

export function useUserSettings() {
  // Get the authenticated user
  const { user, isLoading: isAuthLoading } = useAuth()
  const userId = getUserId(user)
  
  // We'll use this to check if we should use real or mock data
  const useRealData = typeof window !== 'undefined' && 
    isSupabaseConfigured() && 
    !!userId && 
    !shouldUseMockData()
  
  const queryClient = useQueryClient()
  
  // Set up Realtime subscription for user settings
  useEffect(() => {
    if (!useRealData || !userId) return
    
    // Subscribe to changes on the user_settings table for this user
    const settingsSubscription = supabaseClient
      .channel('user-settings-channel')
      .on('postgres_changes', {
        event: '*', // Listen for all events (insert, update, delete)
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('User settings change received:', payload)
        
        // Refresh the user settings data when changes occur
        queryClient.invalidateQueries({ queryKey: ['user-settings', userId] })
      })
      .subscribe()
    
    // Clean up subscription when component unmounts
    return () => {
      settingsSubscription.unsubscribe()
    }
  }, [userId, useRealData, queryClient])
  
  // Fetch user settings
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      if (!useRealData) {
        return MOCK_USER_SETTINGS
      }
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      try {
        const { data, error } = await supabaseClient
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (error) throw error
        
        // Transform from DB format to application format
        return {
          id: data.id,
          userId: data.user_id,
          theme: data.theme,
          securityLevel: data.security_level,
          notificationsEnabled: data.notifications_enabled,
          defaultMode: data.default_mode,
        } as UserSettings
      } catch (error) {
        console.error('Error fetching user settings:', error)
        throw new Error('Failed to fetch user settings')
      }
    },
    enabled: !isAuthLoading, // Only run query when auth state is determined
  })
  
  // Mutation to update user settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<UserSettingsInput>) => {
      // Validate the input using Zod schema
      try {
        // We only validate the fields that are provided
        const partialSchema = UserSettingsSchema.partial()
        partialSchema.parse(newSettings)
      } catch (validationError) {
        console.error('Validation error:', validationError)
        throw new Error('Invalid settings data')
      }
      
      if (!useRealData) {
        // Mock implementation
        return {
          ...MOCK_USER_SETTINGS,
          ...newSettings,
        }
      }
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      try {
        // Transform to DB format
        const dbSettings: Record<string, any> = {}
        if (newSettings.theme) dbSettings.theme = newSettings.theme
        if (newSettings.securityLevel) dbSettings.security_level = newSettings.securityLevel
        if (newSettings.notificationsEnabled !== undefined) dbSettings.notifications_enabled = newSettings.notificationsEnabled
        if (newSettings.defaultMode) dbSettings.default_mode = newSettings.defaultMode
        
        // Update in Supabase
        const { data, error } = await supabaseClient
          .from('user_settings')
          .update(dbSettings)
          .eq('user_id', userId)
          .select()
        
        if (error) throw error
        return data[0]
      } catch (error) {
        console.error('Error updating user settings:', error)
        throw new Error('Failed to update user settings')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', userId] })
    },
  })
  
  return {
    settings: settings || MOCK_USER_SETTINGS,
    isLoading: isLoading || isAuthLoading,
    error,
    updateSettings,
  }
} 