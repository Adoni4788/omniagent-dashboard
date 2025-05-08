'use client'

import { useState, useEffect } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import TaskFeed from '@/components/task-feed'
import TaskDetails from '@/components/task-details'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Alert } from '@/components/ui/alert'
import type { Task } from '@/lib/types'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'

export default function TasksPage() {
  const { tasks, isLoading, error, createTask, refreshTasks } = useTasks()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  // Polling for task updates
  useEffect(() => {
    // Poll every 10 seconds for task updates
    const interval = setInterval(() => {
      if (user) {
        refreshTasks()
      }
    }, 10000)
    
    return () => clearInterval(interval)
  }, [refreshTasks, user])

  // Select first task by default when tasks load or when tasks change
  useEffect(() => {
    if (tasks.length > 0 && (!selectedTask || !tasks.find(t => t.id === selectedTask.id))) {
      setSelectedTask(tasks[0])
    }
  }, [tasks, selectedTask])

  // Handle creating a new sample task
  const handleCreateTask = async () => {
    try {
      // Show toast for creation started
      const toastId = toast({
        title: "Creating new task",
        description: "Your task is being created...",
      })
      
      const newTask = {
        name: 'Task ' + new Date().toLocaleTimeString(),
        status: 'queued',
        steps: [
          {
            name: 'Initialize task',
            actionType: 'preparation',
            status: 'completed',
            log: 'Task initialization completed',
          },
          {
            name: 'Process data',
            actionType: 'data',
            status: 'running',
            log: 'Processing data...',
          }
        ],
        preview: null,
        securityLevel: 'class1',
      }
      
      // Optimistically update UI
      queryClient.setQueryData(['tasks', user?.id], (oldData: Task[] = []) => {
        const optimisticTask: Task = {
          ...newTask,
          id: `optimistic-${Date.now()}`,
          timestamp: new Date().toISOString(),
        }
        return [optimisticTask, ...oldData]
      })
      
      // Actually create the task
      const result = await createTask.mutateAsync(newTask)
      
      // Update toast when successful
      toast({
        id: toastId,
        title: "Task created",
        description: "Your new task has been created successfully.",
        variant: "success",
      })
      
      // Select the newly created task
      setSelectedTask(result as any)
    } catch (error) {
      console.error('Failed to create task:', error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    refreshTasks()
    toast({
      title: "Refreshing tasks",
      description: "Getting the latest tasks data...",
    })
  }

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isLoading}
            title="Refresh tasks"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreateTask} disabled={createTask.isPending}>
            {createTask.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Task
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <p>Error loading tasks: {(error as Error).message}</p>
        </Alert>
      )}

      {isLoading && tasks.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-4rem)]">
          <div className="md:col-span-1 h-full overflow-y-auto pr-2">
            <TaskFeed
              tasks={tasks}
              selectedTask={selectedTask}
              onSelectTask={(task) => setSelectedTask(task)}
              isLoading={isLoading}
            />
          </div>
          <div className="md:col-span-2 border rounded-lg p-4 bg-background h-full overflow-y-auto">
            {selectedTask ? (
              <TaskDetails task={selectedTask} />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>Select a task to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 