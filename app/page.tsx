'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  useEffect(() => {
    if (!isLoading) {
      // Redirect to dashboard if logged in, otherwise to login page
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, isLoading, router])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary shadow-md">
          <span className="text-4xl font-bold text-primary-foreground">O</span>
        </div>
        <h1 className="text-2xl font-bold">OmniAgent</h1>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
