'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseClient } from '@/lib/supabase-client'
import { Task } from '@/lib/types'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth, getUserId } from '@/lib/auth'
import { z } from 'zod'
import { useEffect } from 'react'

// Validation schema for task inputs
export const TaskInputSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  status: z.string(),
  steps: z.array(z.object({
    name: z.string(),
    actionType: z.string(),
    status: z.string(),
    log: z.string().nullable(),
  })).optional(),
  preview: z.string().nullable(),
  securityLevel: z.enum(['class1', 'class2', 'class3']),
})

export type TaskInput = z.infer<typeof TaskInputSchema>

// Function to safely check if we should use mock data
function shouldUseMockData(): boolean {
  return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
}

// Mock data for development without Supabase
const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    name: 'Analyze customer feedback data',
    status: 'completed',
    timestamp: '2023-05-01T10:00:00Z',
    steps: [
      {
        id: 'step-1-1',
        name: 'Extract data from feedback system',
        actionType: 'data',
        status: 'completed',
        log: 'Successfully extracted 128 feedback entries',
      },
      {
        id: 'step-1-2',
        name: 'Analyze sentiment patterns',
        actionType: 'analysis',
        status: 'completed',
        log: 'Analysis complete with 76% positive sentiment',
      },
    ],
    preview: null,
    securityLevel: 'class1',
  },
  {
    id: 'task-2',
    name: 'Generate quarterly report',
    status: 'running',
    timestamp: '2023-05-02T14:30:00Z',
    steps: [
      {
        id: 'step-2-1',
        name: 'Collect department metrics',
        actionType: 'data',
        status: 'completed',
        log: 'Metrics collected from all 5 departments',
      },
      {
        id: 'step-2-2',
        name: 'Generate report draft',
        actionType: 'generation',
        status: 'running',
        log: 'Creating executive summary...',
      },
      {
        id: 'step-2-3',
        name: 'Review by leadership',
        actionType: 'review',
        status: 'pending',
        log: null,
      },
    ],
    preview: 'https://example.com/preview/report',
    securityLevel: 'class2',
  },
  {
    id: 'task-3',
    name: 'Deploy website update',
    status: 'awaiting_approval',
    timestamp: '2023-05-03T09:15:00Z',
    steps: [
      {
        id: 'step-3-1',
        name: 'Test in staging environment',
        actionType: 'testing',
        status: 'completed',
        log: 'All tests passed in staging',
      },
      {
        id: 'step-3-2',
        name: 'Deploy to production',
        actionType: 'action',
        status: 'awaiting',
        log: 'Ready for deployment approval',
      },
    ],
    preview: 'https://staging.example.com',
    securityLevel: 'class3',
  },
]

export function useTasks() {
  // Get the authenticated user
  const { user, isLoading: isAuthLoading } = useAuth()
  const userId = getUserId(user)
  
  // Determine if we should use real or mock data
  const useRealData = typeof window !== 'undefined' && 
    isSupabaseConfigured() && 
    !!userId && 
    !shouldUseMockData()
  
  const queryClient = useQueryClient()
  
  // Set up Realtime subscription for tasks
  useEffect(() => {
    if (!useRealData || !userId) return
    
    // Subscribe to changes on the tasks table for this user
    const tasksSubscription = supabaseClient
      .channel('tasks-channel')
      .on('postgres_changes', {
        event: '*', // Listen for all events (insert, update, delete)
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Tasks change received:', payload)
        
        // Refresh the tasks data when changes occur
        queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
      })
      .subscribe()
    
    // Subscribe to changes on the steps table for user's tasks
    const stepsSubscription = supabaseClient
      .channel('steps-channel')
      .on('postgres_changes', {
        event: '*', // Listen for all events
        schema: 'public',
        table: 'steps'
        // Can't filter by user_id directly in steps table
        // Will filter in the handler
      }, async (payload) => {
        console.log('Steps change received:', payload)
        
        if (payload.new && 'task_id' in payload.new) {
          // Get the task_id from the changed step
          const taskId = payload.new.task_id
          
          // Check if this task belongs to the current user
          try {
            const { data, error } = await supabaseClient
              .from('tasks')
              .select('id')
              .eq('id', taskId)
              .eq('user_id', userId)
              .single()
            
            if (data && !error) {
              // If task belongs to user, invalidate query cache
              queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
            }
          } catch (err) {
            console.error('Error checking task ownership:', err)
          }
        }
      })
      .subscribe()
    
    // Clean up subscriptions when component unmounts
    return () => {
      tasksSubscription.unsubscribe()
      stepsSubscription.unsubscribe()
    }
  }, [userId, useRealData, queryClient])
  
  // Fetch all tasks
  const {
    data: tasks,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks', userId],
    queryFn: async () => {
      if (!useRealData) {
        console.log('Using mock task data')
        return MOCK_TASKS
      }
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      try {
        const { data, error } = await supabaseClient
          .from('tasks')
          .select(`
            *,
            steps:steps(*)
          `)
          .eq('user_id', userId) // Filter by user ID to prevent IDOR
          .order('timestamp', { ascending: false })
        
        if (error) throw error
        
        // Transform from DB format to application format
        return data.map((task) => ({
          id: task.id,
          name: task.name,
          status: task.status,
          timestamp: task.timestamp,
          preview: task.preview,
          securityLevel: task.security_level as Task['securityLevel'],
          steps: task.steps.map((step) => ({
            id: step.id,
            name: step.name,
            actionType: step.action_type,
            status: step.status,
            log: step.log,
          })),
        }))
      } catch (error) {
        console.error('Error fetching tasks:', error)
        throw new Error('Failed to fetch tasks')
      }
    },
    enabled: !isAuthLoading, // Only run query when auth state is determined
  })
  
  // Add a refreshTasks function that calls refetch
  const refreshTasks = () => {
    return refetch()
  }
  
  // Function to submit a command for a task
  const submitCommand = useMutation({
    mutationFn: async ({ 
      taskId, 
      command, 
      securityLevel = 'class1' 
    }: { 
      taskId: string; 
      command: string; 
      securityLevel?: Task['securityLevel']; 
    }) => {
      if (!useRealData) {
        // Mock implementation
        const timestamp = '2023-05-04T14:30:00Z' // Use a static timestamp to prevent hydration issues
        const stepId = `step-mock-${taskId}-${Date.now().toString().slice(-6)}`
        
        // Update the task in the mock data
        const updatedTasks = (tasks || []).map(task => {
          if (task.id === taskId) {
            // Add a new step for the command
            return {
              ...task,
              steps: [
                ...task.steps,
                {
                  id: stepId,
                  name: `Execute command: ${command.slice(0, 20)}${command.length > 20 ? '...' : ''}`,
                  actionType: 'action',
                  status: 'completed',
                  log: `Executed command: ${command}\nCompleted at ${new Date().toLocaleTimeString()}`,
                }
              ]
            }
          }
          return task
        })
        
        // Update the cache
        queryClient.setQueryData(['tasks', userId], updatedTasks)
        
        return {
          success: true,
          stepId,
          timestamp
        }
      }
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      try {
        // In a real app, we would send the command to the backend
        const { data, error } = await supabaseClient
          .from('steps')
          .insert({
            task_id: taskId,
            name: `Execute command: ${command.slice(0, 20)}${command.length > 20 ? '...' : ''}`,
            action_type: 'action',
            status: 'running',
            log: `Executing command: ${command}\nStarted at ${new Date().toLocaleTimeString()}`,
          })
          .select()
        
        if (error) throw error
        
        // In a real implementation, we would trigger a background job
        // to execute the command and then update the step status
        
        // For demo purposes, we'll just update the step after a delay
        setTimeout(async () => {
          await supabaseClient
            .from('steps')
            .update({
              status: 'completed',
              log: `Executed command: ${command}\nCompleted at ${new Date().toLocaleTimeString()}\nOutput: Command executed successfully.`,
            })
            .eq('id', data[0].id)
          
          // Refresh the tasks after the step is updated
          refreshTasks()
        }, 2000)
        
        return {
          success: true,
          stepId: data[0].id,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        console.error('Error submitting command:', error)
        throw new Error('Failed to submit command')
      }
    },
    onSuccess: () => {
      // Refresh tasks after command is submitted
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
  
  // Mutation to create a new task
  const createTask = useMutation({
    mutationFn: async (newTask: TaskInput) => {
      // Validate input
      try {
        TaskInputSchema.parse(newTask)
      } catch (validationError) {
        console.error('Validation error:', validationError)
        throw new Error('Invalid task data')
      }
      
      if (!useRealData) {
        // Mock implementation
        const task: Task = {
          ...newTask,
          id: `task-mock-${Date.now().toString().slice(-6)}`,
          timestamp: '2023-05-04T15:00:00Z', // Use a static timestamp to prevent hydration issues
          steps: newTask.steps || [],
        }
        return task
      }
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      try {
        // Real implementation with Supabase
        const { data, error } = await supabaseClient
          .from('tasks')
          .insert({
            name: newTask.name,
            status: newTask.status,
            security_level: newTask.securityLevel,
            preview: newTask.preview,
            user_id: userId,
          })
          .select()
        
        if (error) throw error
        
        // Create steps if provided
        if (newTask.steps && newTask.steps.length > 0) {
          const stepsToInsert = newTask.steps.map(step => ({
            task_id: data[0].id,
            name: step.name,
            action_type: step.actionType,
            status: step.status,
            log: step.log,
          }))
          
          const { error: stepsError } = await supabaseClient
            .from('steps')
            .insert(stepsToInsert)
          
          if (stepsError) throw stepsError
        }
        
        return data[0]
      } catch (error) {
        console.error('Error creating task:', error)
        throw new Error('Failed to create task')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] })
    },
  })
  
  return {
    tasks: tasks || [],
    isLoading: isLoading || isAuthLoading,
    error,
    createTask,
    submitCommand,
    refreshTasks,
  }
} 