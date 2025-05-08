import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'
import { AppError } from './error-handling'

// Required environment variables for Supabase
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

// Create a Supabase client for server-side operations (with admin privileges)
function createSupabaseAdmin() {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new AppError(
      'Supabase environment variables are missing',
      500,
      true,
      { 
        missingVars: !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : 'SUPABASE_SERVICE_ROLE_KEY'
      }
    )
  }
  
  // Check for default values (which would indicate incomplete setup)
  if (supabaseUrl === 'https://your-project.supabase.co') {
    throw new AppError(
      'Supabase URL is set to default value. Please configure your .env.local file.',
      500,
      true
    )
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Lazy-initialize the admin client to avoid initialization errors in environments 
// where env vars aren't available
let _supabaseAdmin: ReturnType<typeof createSupabaseAdmin> | null = null

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    try {
      _supabaseAdmin = createSupabaseAdmin()
    } catch (error) {
      console.error('Failed to initialize Supabase admin client:', error)
      throw error
    }
  }
  return _supabaseAdmin
}

// Function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  try {
    const hasAllVars = REQUIRED_ENV_VARS.every(varName => !!process.env[varName])
    const hasValidUrl = process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co'
    
    return hasAllVars && hasValidUrl
  } catch (error) {
    console.error('Error checking Supabase configuration:', error)
    return false
  }
} 