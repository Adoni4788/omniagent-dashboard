'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { useTasks } from '@/hooks/use-tasks'

// Function to safely format dates on client
function formatDate(dateString: string) {
  if (typeof window === 'undefined') {
    return { date: '...', time: '...' }
  }
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString()
  }
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { tasks, isLoading, error, refreshTasks } = useTasks()
  const { toast } = useToast()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Get counts for different task statuses
  const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0
  const errorTasks = tasks?.filter(task => task.status === 'error').length || 0
  const runningTasks = tasks?.filter(task => task.status === 'running').length || 0
  const pendingTasks = tasks?.filter(task => task.status === 'pending').length || 0
  const totalTasks = tasks?.length || 0
  
  // Get the most recent tasks (up to 5)
  const recentTasks = [...(tasks || [])]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshTasks()
      toast({
        title: 'Dashboard refreshed',
        description: 'The latest data has been loaded.',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Refresh failed',
        description: 'There was an error refreshing the dashboard.',
      })
    } finally {
      setIsRefreshing(false)
    }
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      <div className="text-muted-foreground">
        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard data: {error.message}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{isLoading ? '-' : completedTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{isLoading ? '-' : runningTasks + pendingTasks}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{isLoading ? '-' : errorTasks}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>
              Your 5 most recent tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="space-y-2">
                {recentTasks.map(task => {
                  // Only format dates on the client side
                  const formattedDate = isClient 
                    ? formatDate(task.timestamp)
                    : { date: '...', time: '...' }
                    
                  return (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        {task.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {task.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                        {(task.status === 'running' || task.status === 'pending') && <Clock className="h-4 w-4 text-amber-600" />}
                        
                        <div>
                          <div className="font-medium">{task.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formattedDate.date} at {formattedDate.time}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/tasks?taskId=${task.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No tasks found. Create your first task to get started.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/dashboard/tasks">View All Tasks</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common operations you can perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard/tasks?new=true">
                Create New Task
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/console">
                Open Command Console
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/preview">
                View Live Preview
              </Link>
            </Button>
            
            {isAdmin && (
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/settings">
                  Manage Settings
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 