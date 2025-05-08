import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import { supabaseClient } from '@/lib/supabase-client'

// Mock the useAuth hook which is used by useTasks
jest.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isLoading: false,
  }),
  getUserId: () => 'test-user-id',
}))

// Mock the isSupabaseConfigured function to control when we use real or mock data
jest.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: jest.fn().mockReturnValue(true),
}))

// Create a wrapper for the QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useTasks Hook', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Mock the environment variable
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false'
  })

  it('should fetch tasks successfully', async () => {
    // Mock the Supabase response
    const mockTasks = [
      {
        id: 'task-1',
        name: 'Test Task',
        status: 'completed',
        timestamp: '2023-05-01T10:00:00Z',
        preview: null,
        security_level: 'class1',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            action_type: 'test',
            status: 'completed',
            log: 'Test log',
          },
        ],
        user_id: 'test-user-id',
      },
    ]

    // Setup the Supabase client mock
    const selectMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockTasks,
          error: null,
        }),
      }),
    })

    ;(supabaseClient.from as jest.Mock).mockReturnValue({
      select: selectMock,
    })

    // Render the hook
    const { result, waitFor } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    })

    // Initial state should be loading with no data
    expect(result.current.isLoading).toBe(true)
    expect(result.current.tasks).toBeUndefined()

    // Wait for the query to complete
    await waitFor(() => {
      return result.current.isLoading === false
    })

    // Check that the tasks are returned correctly
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks?.[0].name).toBe('Test Task')
    expect(result.current.tasks?.[0].steps).toHaveLength(1)
    expect(result.current.tasks?.[0].steps[0].name).toBe('Test Step')

    // Verify Supabase was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('tasks')
    expect(selectMock).toHaveBeenCalled()
  })

  it('should handle errors when fetching tasks', async () => {
    // Setup the Supabase client to return an error
    const selectMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    })

    ;(supabaseClient.from as jest.Mock).mockReturnValue({
      select: selectMock,
    })

    // Render the hook
    const { result, waitFor } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    })

    // Wait for the query to complete
    await waitFor(() => {
      return result.current.error !== null
    })

    // Check that an error is returned
    expect(result.current.error).toBeTruthy()
    expect(result.current.tasks).toBeUndefined()
  })

  it('should use mock data when NEXT_PUBLIC_USE_MOCK_DATA is true', async () => {
    // Set the environment variable to use mock data
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true'

    // Render the hook
    const { result, waitFor } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    })

    // Wait for the query to complete
    await waitFor(() => {
      return result.current.isLoading === false
    })

    // Check that mock data is returned
    expect(result.current.tasks).toBeTruthy()
    expect(result.current.tasks?.length).toBeGreaterThan(0)
    expect(supabaseClient.from).not.toHaveBeenCalled() // Supabase should not be called
  })

  it('should submit command successfully', async () => {
    // Mock the Supabase response for the task query
    const mockTasks = [
      {
        id: 'task-1',
        name: 'Test Task',
        status: 'in_progress',
        timestamp: '2023-05-01T10:00:00Z',
        preview: null,
        security_level: 'class1',
        steps: [],
        user_id: 'test-user-id',
      },
    ]

    // Setup the Supabase client mock for select
    const selectMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockTasks,
          error: null,
        }),
      }),
    })

    // Setup the Supabase client mock for insert
    const insertMock = jest.fn().mockResolvedValue({
      data: [{ id: 'step-new', task_id: 'task-1' }],
      error: null,
    })

    ;(supabaseClient.from as jest.Mock).mockImplementation((table) => {
      if (table === 'tasks') {
        return {
          select: selectMock,
        }
      } else if (table === 'steps') {
        return {
          insert: insertMock,
        }
      }
      return {}
    })

    // Render the hook
    const { result, waitFor } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    })

    // Wait for the initial query to complete
    await waitFor(() => {
      return result.current.isLoading === false
    })

    // Submit a command
    await act(async () => {
      await result.current.submitCommand({
        taskId: 'task-1',
        command: 'test command',
      })
    })

    // Verify the insert was called correctly
    expect(supabaseClient.from).toHaveBeenCalledWith('steps')
    expect(insertMock).toHaveBeenCalled()
  })
}) 