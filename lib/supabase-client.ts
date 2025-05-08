'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './supabase-types'
import { AppError } from './error-handling'

// Create a Supabase client for client-side operations (with anonymous user privileges)
function createSupabaseClient() {
  // Environment variables are available via Next.js public env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are missing')
    throw new AppError(
      'Application configuration is incomplete',
      500,
      true
    )
  }
  
  // Check for default values (which would indicate incomplete setup)
  if (supabaseUrl === 'https://your-project.supabase.co') {
    console.error('Supabase URL is set to default value')
    throw new AppError(
      'Application configuration is incomplete',
      500,
      true
    )
  }
  
  return createClientComponentClient<Database>()
}

// Create the client only when needed
export function getSupabaseClient() {
  try {
    return createSupabaseClient()
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    throw error
  }
}

// For backward compatibility
export const supabaseClient = createClientComponentClient<Database>() 