// Custom error class with additional information
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>
  
  constructor(
    message: string, 
    statusCode = 500, 
    isOperational = true,
    context?: Record<string, any>
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    Error.captureStackTrace(this, this.constructor)
  }
}

// Standard error types
export const ErrorTypes = {
  AUTHENTICATION_ERROR: 'auth_error',
  AUTHORIZATION_ERROR: 'authorization_error',
  VALIDATION_ERROR: 'validation_error', 
  NOT_FOUND_ERROR: 'not_found_error',
  SERVER_ERROR: 'server_error',
  DATABASE_ERROR: 'database_error',
  API_ERROR: 'api_error',
  NETWORK_ERROR: 'network_error',
  RATE_LIMIT_ERROR: 'rate_limit_error',
} as const

export type ErrorType = keyof typeof ErrorTypes

// User-friendly error messages
export const UserFriendlyErrors = {
  [ErrorTypes.AUTHENTICATION_ERROR]: 'Authentication failed. Please sign in again.',
  [ErrorTypes.AUTHORIZATION_ERROR]: 'You don\'t have permission to perform this action.',
  [ErrorTypes.VALIDATION_ERROR]: 'The provided information is invalid.',
  [ErrorTypes.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [ErrorTypes.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ErrorTypes.DATABASE_ERROR]: 'Unable to access the database. Please try again later.',
  [ErrorTypes.API_ERROR]: 'Error connecting to the service. Please try again.',
  [ErrorTypes.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
  [ErrorTypes.RATE_LIMIT_ERROR]: 'Too many requests. Please try again later.',
}

// Function to sanitize errors for client-side display
export function handleApiError(error: unknown): { 
  message: string, 
  status: number, 
  type: string,
  friendlyMessage: string,
} {
  // Already an AppError
  if (error instanceof AppError) {
    const errorType = Object.values(ErrorTypes).includes(error.context?.type as any)
      ? error.context?.type as ErrorType
      : ErrorTypes.SERVER_ERROR

    return { 
      message: error.message, 
      status: error.statusCode,
      type: error.isOperational ? 'operational' : 'programming',
      friendlyMessage: UserFriendlyErrors[errorType] || error.message,
    }
  }
  
  // Handle Supabase errors
  if (typeof error === 'object' && error !== null) {
    const supabaseError = error as any
    
    // PostgreSQL error
    if (supabaseError.code && supabaseError.code.startsWith('22') || supabaseError.code.startsWith('23')) {
      return {
        message: supabaseError.message || 'Database error',
        status: 400,
        type: ErrorTypes.DATABASE_ERROR,
        friendlyMessage: UserFriendlyErrors[ErrorTypes.DATABASE_ERROR],
      }
    }
    
    // Authentication error
    if (supabaseError.code && supabaseError.code.startsWith('P0001')) {
      return {
        message: supabaseError.message || 'Authentication error',
        status: 401,
        type: ErrorTypes.AUTHENTICATION_ERROR,
        friendlyMessage: UserFriendlyErrors[ErrorTypes.AUTHENTICATION_ERROR],
      }
    }
  }

  // Standard error
  if (error instanceof Error) {
    // Network error
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      return {
        message: error.message,
        status: 503,
        type: ErrorTypes.NETWORK_ERROR,
        friendlyMessage: UserFriendlyErrors[ErrorTypes.NETWORK_ERROR],
      }
    }
    
    return {
      message: error.message,
      status: 500,
      type: ErrorTypes.SERVER_ERROR,
      friendlyMessage: UserFriendlyErrors[ErrorTypes.SERVER_ERROR],
    }
  }
  
  // Log the detailed error for debugging
  console.error('Unexpected error:', error)
  
  // Return a sanitized error to the client
  return { 
    message: 'An unexpected error occurred', 
    status: 500,
    type: ErrorTypes.SERVER_ERROR,
    friendlyMessage: UserFriendlyErrors[ErrorTypes.SERVER_ERROR],
  }
}

// Handle database errors specifically
export function handleDatabaseError(error: any) {
  // Log the detailed error for server debugging
  console.error('Database error:', error)
  
  // Create a sanitized error to return to the client
  return new AppError(
    'A database error occurred. Please try again later.',
    500,
    true,
    { errorCode: 'database_error', type: ErrorTypes.DATABASE_ERROR }
  )
}

// Function to validate that required environment variables exist
export function validateEnvironmentVariables(requiredVars: string[]): boolean {
  const missing = requiredVars.filter(varName => !process.env[varName])
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`)
    return false
  }
  
  return true
}

// Client-side error handling hook
export function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: string) => {
      const processedError = handleApiError(error)
      
      // Log error with context for debugging
      console.error(`Error in ${context || 'unknown context'}:`, {
        originalError: error,
        processedError,
      })
      
      return processedError
    }
  }
} 