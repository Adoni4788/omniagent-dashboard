'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  Terminal,
  MonitorPlay,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const { isAdmin } = useAuth()
  
  const routes = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard',
      exact: true,
    },
    {
      href: '/dashboard/tasks',
      icon: ListTodo,
      title: 'Tasks',
    },
    {
      href: '/dashboard/console',
      icon: Terminal,
      title: 'Console',
    },
    {
      href: '/dashboard/preview',
      icon: MonitorPlay,
      title: 'Preview',
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      title: 'Settings',
      requireAdmin: true,
    },
  ]
  
  return (
    <div className="hidden border-r bg-background h-[calc(100vh-4rem)] md:block md:w-64" {...props}>
      <ScrollArea className="h-full py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="px-4 text-lg font-semibold tracking-tight">
              Navigation
            </h2>
            <nav className="grid gap-1 px-2">
              {routes.map((route) => {
                // Skip admin-only routes for non-admin users
                if (route.requireAdmin && !isAdmin) {
                  return null
                }
                
                const isActive = route.exact 
                  ? pathname === route.href
                  : pathname.startsWith(route.href)
                  
                return (
                  <Button
                    key={route.href}
                    variant={isActive ? "secondary" : "ghost"}
                    asChild
                    className="justify-start"
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.title}
                    </Link>
                  </Button>
                )
              })}
            </nav>
          </div>
          
          {isAdmin && (
            <div className="mt-6 space-y-1">
              <h2 className="px-4 text-lg font-semibold tracking-tight">Admin</h2>
              <div className="px-3 py-2">
                <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <div className="flex items-center">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <p className="text-xs">You have admin privileges</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 