import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/reset-password', '/auth/callback']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  // Refresh session if it exists
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Check if the route is public or requires authentication
  const path = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return response
  }
  
  // If it's a dashboard route and the user is not authenticated, redirect to login
  if (path.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL(`/login?redirectTo=${encodeURIComponent(path)}`, request.url))
  }
  
  // Special handling for root path
  if (path === '/') {
    // If authenticated, redirect to dashboard, otherwise to login
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return response
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    // Apply to all paths except next assets, api, and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 