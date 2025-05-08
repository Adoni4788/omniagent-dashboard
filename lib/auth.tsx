'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Admin email list - in a real app, this would be stored in a database
// with proper role management
const ADMIN_EMAILS = ['admin@example.com']

// Mock user for local development without Supabase
const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'user@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: '',
  created_at: '2023-05-01T00:00:00Z' // Use a static timestamp to prevent hydration mismatches
}

// Check if we should use mock data
// This correctly evaluates the environment variable on the client side
const useMockData = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Add a function to safely check mock data status to avoid issues during SSR
function shouldUseMockData(): boolean {
  return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data: any }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data: any }>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  sendMagicLink: (email: string) => Promise<{ error: AuthError | null; data: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()
  
  // Fetch session and set up auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      
      try {
        // Use the function to check for mock data to ensure consistency
        if (shouldUseMockData()) {
          // Use mock data for local development
          console.log('Using mock auth data')
          setUser(MOCK_USER)
          setSession({ user: MOCK_USER } as Session)
          setIsLoading(false)
          return
        }
        
        // Get current session from Supabase
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          // Check if user is admin
          if (currentSession.user?.email && ADMIN_EMAILS.includes(currentSession.user.email)) {
            setIsAdmin(true)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeAuth()
    
    if (shouldUseMockData()) return // Skip auth listener with mock data
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      
      // Update admin status
      if (newSession?.user?.email && ADMIN_EMAILS.includes(newSession.user.email)) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
      
      // Handle auth events
      if (event === 'SIGNED_IN' && pathname === '/login') {
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })
    
    // Clean up subscription
    return () => {
      if (!shouldUseMockData() && subscription) {
        subscription.unsubscribe()
      }
    }
  }, [supabase, router, pathname])
  
  // Mock functions for auth operations when using mock data
  const mockAuthResponse = async () => {
    return { error: null, data: { user: MOCK_USER, session: { user: MOCK_USER } } }
  }
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (shouldUseMockData()) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
      return mockAuthResponse()
    }
    
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }
  
  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    if (shouldUseMockData()) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
      return mockAuthResponse()
    }
    
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
  
  // Send magic link
  const sendMagicLink = async (email: string) => {
    if (shouldUseMockData()) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
      return mockAuthResponse()
    }
    
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }
  
  // Sign out
  const signOut = async () => {
    if (shouldUseMockData()) {
      setUser(null)
      setSession(null)
      router.push('/login')
      return
    }
    
    await supabase.auth.signOut()
    router.push('/login')
  }
  
  // Refresh session
  const refreshSession = async () => {
    if (shouldUseMockData()) return
    
    const { data } = await supabase.auth.refreshSession()
    setSession(data.session)
    setUser(data.session?.user || null)
  }
  
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAdmin: shouldUseMockData() ? true : isAdmin, // Always true for mock data to show admin features
    signIn,
    signUp,
    signOut,
    refreshSession,
    sendMagicLink,
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Utility to extract user ID
export function getUserId(user: User | null): string | null {
  return user?.id ?? null
}

// Auth route middleware component
type ProtectedRouteProps = {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)
      } else if (requireAdmin && !isAdmin) {
        router.push('/dashboard') // Redirect non-admin users
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, router, pathname])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!user || (requireAdmin && !isAdmin)) {
    return null
  }
  
  return <>{children}</>
} 