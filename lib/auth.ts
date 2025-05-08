'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { type Session, type User } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// Create a custom hook for authentication
export function useAuth() {
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setIsLoading(false)
      }
    )

    // Initial fetch of the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn: (email: string, password: string) => 
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) => 
      supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }
}

// Create a server-side utility for checking auth status
export function createServerClient(cookies: {
  get: (name: string) => { value: string } | undefined
}) {
  return createClientComponentClient<Database>({
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value
      },
    },
  })
}

// Helper to get the current user's ID safely
export function getUserId(user: User | null): string | null {
  return user?.id || null
} 